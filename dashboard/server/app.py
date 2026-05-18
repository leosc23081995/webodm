"""FastAPI server that exposes the LRA/Mindray dashboard with basic auth.

Routes:
  GET  /              → Dashboard LRA (auth required)
  GET  /ia            → Dashboard IA
  GET  /flow          → Mindray Flow
  GET  /upload        → upload form for the two source spreadsheets
  POST /upload        → accepts xlsx files, regenerates window.DASH
  GET  /api/dash      → returns the current window.DASH as JSON
  GET  /static/*      → all dashboard assets (jsx, css, js, screenshots)

Credentials come from env DASHBOARD_USER / DASHBOARD_PASS (default admin/admin).

Run:
  pip install -r dashboard/server/requirements.txt
  uvicorn dashboard.server.app:app --reload --port 8000

The /dashboard folder layout is unchanged; this server only adds an auth
layer and an upload endpoint on top of it.
"""
from __future__ import annotations

import json
import os
import secrets
import sys
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Allow importing build_data from sibling scripts/ folder
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import build_data  # noqa: E402

DATA_DIR = ROOT / "data"
TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

USERNAME = os.getenv("DASHBOARD_USER", "admin")
PASSWORD = os.getenv("DASHBOARD_PASS", "admin")

app = FastAPI(title="Dashboard LRA/Mindray", docs_url=None, redoc_url=None)
security = HTTPBasic()
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


def require_auth(credentials: Annotated[HTTPBasicCredentials, Depends(security)]) -> str:
    ok_user = secrets.compare_digest(credentials.username.encode(), USERNAME.encode())
    ok_pass = secrets.compare_digest(credentials.password.encode(), PASSWORD.encode())
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": 'Basic realm="Dashboard LRA"'},
        )
    return credentials.username


Auth = Annotated[str, Depends(require_auth)]


# ---------------------------------------------------------------------------
# Static asset serving (auth-gated). We can't use StaticFiles directly because
# it bypasses dependencies, so we route through an explicit endpoint.
# ---------------------------------------------------------------------------
ALLOWED_EXT = {".html", ".css", ".js", ".jsx", ".png", ".jpg", ".jpeg", ".svg",
               ".pdf", ".xlsx", ".woff", ".woff2"}


def _safe_file(rel: str) -> Path:
    p = (ROOT / rel).resolve()
    if not str(p).startswith(str(ROOT.resolve())):
        raise HTTPException(status_code=400, detail="Caminho inválido")
    if not p.is_file():
        raise HTTPException(status_code=404, detail=f"Não encontrado: {rel}")
    if p.suffix.lower() not in ALLOWED_EXT:
        raise HTTPException(status_code=403, detail=f"Extensão não permitida: {p.suffix}")
    return p


@app.get("/", response_class=HTMLResponse)
def root(user: Auth):
    return FileResponse(_safe_file("Dashboard LRA.html"))


@app.get("/ia", response_class=HTMLResponse)
def ia(user: Auth):
    return FileResponse(_safe_file("Dashboard IA.html"))


@app.get("/flow", response_class=HTMLResponse)
def flow(user: Auth):
    return FileResponse(_safe_file("Mindray Flow.html"))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/dash")
def api_dash(user: Auth):
    js_path = ROOT / "dashboard-data.js"
    if not js_path.exists():
        raise HTTPException(status_code=404, detail="dashboard-data.js ainda não gerado")
    text = js_path.read_text(encoding="utf-8")
    # strip the "window.DASH = " prefix and trailing ";\n"
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise HTTPException(status_code=500, detail="dashboard-data.js corrompido")
    return JSONResponse(json.loads(text[start : end + 1]))


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------
@app.get("/upload", response_class=HTMLResponse)
def upload_form(request: Request, user: Auth):
    stats = _current_stats()
    return templates.TemplateResponse(
        request,
        "upload.html",
        {"stats": stats, "user": user, "message": None},
    )


@app.post("/upload", response_class=HTMLResponse)
async def upload_submit(
    request: Request,
    user: Auth,
    wb2: UploadFile = File(..., description="WB2_Categoria_Completa.xlsx"),
    previsao: UploadFile = File(..., description="PREVISAO_DE_CONSUMO_TUBOS.xlsx"),
):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    wb2_path = DATA_DIR / "WB2_Categoria_Completa.xlsx"
    prev_path = DATA_DIR / "PREVISAO_DE_CONSUMO_TUBOS.xlsx"

    for upload, dest in [(wb2, wb2_path), (previsao, prev_path)]:
        if not upload.filename.lower().endswith(".xlsx"):
            raise HTTPException(status_code=400, detail=f"{upload.filename}: precisa ser .xlsx")
        dest.write_bytes(await upload.read())

    try:
        stats = build_data.build(wb2_path, prev_path, ROOT / "dashboard-data.js")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Falha ao gerar dados: {exc}") from exc

    return templates.TemplateResponse(
        request,
        "upload.html",
        {
            "stats": stats,
            "user": user,
            "message": "Planilhas processadas com sucesso. window.DASH atualizado.",
        },
    )


def _current_stats() -> dict | None:
    js = ROOT / "dashboard-data.js"
    if not js.exists():
        return None
    return {
        "bytes": js.stat().st_size,
        "wb2": (DATA_DIR / "WB2_Categoria_Completa.xlsx").exists(),
        "previsao": (DATA_DIR / "PREVISAO_DE_CONSUMO_TUBOS.xlsx").exists(),
    }


# ---------------------------------------------------------------------------
# Asset catch-all (auth-gated). Mounted last so explicit routes win.
# ---------------------------------------------------------------------------
@app.get("/{path:path}")
def serve_asset(path: str, user: Auth):
    return FileResponse(_safe_file(path))
