# Dashboard LRA / Mindray

Dashboard de Arquitetura de Informação para análise financeira e operacional
(LRA / Mindray) sobre os bancos DESCART e REUNIDOS. Cobre 29 meses de dados
(jan/2024 → mai/2026).

## Estrutura

```
dashboard/
├── Dashboard IA.html        # Documento "Arquitetura de Informação" (estático)
├── Dashboard LRA.html       # Container que monta as camadas L0–L5
├── Mindray Flow.html        # Fluxograma de processos de amostras
├── dashboard-data.js        # Auto-gerado — expõe window.DASH
├── dashboard-l0-l1.jsx      # L0 síntese executiva + L1 visão por empresa
├── dashboard-l2-l3.jsx      # L2 categoria + L3 fabricante
├── dashboard-l4.jsx         # L4 contratos / comodato
├── dashboard-l5.jsx         # L5 detalhamento por SKU
├── dashboard-charts.jsx     # Primitivas de gráfico
├── dashboard-styles.css
├── design-canvas.jsx        # Layout "blueprint"
├── icons.jsx
├── tokens.css               # Tokens de design (cores, tipografia)
├── data.js                  # Dados estáticos do Mindray Flow (window.MINDRAY_DATA)
├── data/
│   ├── WB2_Categoria_Completa.xlsx
│   └── PREVISAO_DE_CONSUMO_TUBOS.xlsx
├── scripts/
│   └── build_data.py        # Regera dashboard-data.js a partir das planilhas
└── screenshots/
```

## Stack

- HTML + React 18 + Babel standalone (CDN) — zero build, abrir o `.html` no
  navegador já funciona.
- Os componentes ficam em `.jsx` separados, carregados via
  `<script type="text/babel" src="...">`.
- Estilo via CSS tradicional + tokens em `tokens.css`.

Não há bundler nem dependência de Node — qualquer servidor estático serve.

## Regerar os dados

Sempre que as planilhas em `dashboard/data/` forem atualizadas:

```bash
pip install openpyxl
python3 dashboard/scripts/build_data.py
```

Isso reescreve `dashboard/dashboard-data.js` com `window.DASH = {...}`.

## Rodar local

```bash
cd dashboard
python3 -m http.server 8080
# abrir http://localhost:8080/Dashboard%20LRA.html
```

## Estrutura de `window.DASH`

Mapeamento de telas → chaves consumidas:

| Tela | Chaves principais |
|------|-------------------|
| L0–L1 | `kpis`, `intercompany`, `sazonalidade*`, `topClientesReun`, `achados` |
| L2–L3 | `categorias`, `fabricantes`, `fabricantesMensal` |
| L4 | `contratos`, `comodato`, `kpis.contratos`, `kpis.remuneracao` |
| L5 | `equipamentos`, `consumiveis`, `previsao` |

Chaves novas (derivadas das planilhas):

- `categorias` — Resumo por categoria × banco (sheet 1)
- `fabricantes` / `fabricantesTodos` — Top 50 / lista completa (sheet 2)
- `fabricantesMensal` — Top 100 fabricante × categoria × 29 meses (sheet 3)
- `equipamentos` — Top 30 SKUs de equipamento (sheet 4)
- `consumiveis` — Top 50 SKUs de consumível (sheet 5)
- `comodato` — Top 30 equipamentos cedidos (sheet 7)
- `devolucao` — Top 30 devoluções (sheet 8)
- `transfInterna` — Top 30 transferências internas (sheet 9)
- `previsao` — Previsão de consumo de tubos (planilha PREVISAO)

Chaves legadas mantidas para compatibilidade com L0–L5 (preenchidas onde
derivável, vazias quando não cobertas pelas planilhas): `capDescart`,
`capReunidos`, `carDescart`, `carReunidos`, `reconciliacao`,
`despesasDescart`, `despesasReunidos`, `setores`.
