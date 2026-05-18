FROM python:3.12-slim

WORKDIR /app

COPY dashboard/server/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY dashboard /app/dashboard

ENV PORT=8000 DASHBOARD_USER=admin DASHBOARD_PASS=admin
EXPOSE 8000

CMD ["python3", "-m", "uvicorn", "dashboard.server.app:app", "--host", "0.0.0.0", "--port", "8000"]
