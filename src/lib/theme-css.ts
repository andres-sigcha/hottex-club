export const themeCss = `
:root {
  --bg: #f8fafc;
  --card: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --brand: #7c3aed;
  --brand2: #4f46e5;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: var(--text); background: radial-gradient(900px 500px at 0% -5%, #eef2ff, transparent), var(--bg); }
a { color: inherit; text-decoration: none; }
.wrap { max-width: 1120px; margin: 0 auto; padding: 28px 18px 40px; }

h1, h2, h3, h4 { margin: 0 0 10px; line-height: 1.15; letter-spacing: -0.02em; }
h1 { font-size: clamp(30px, 4.5vw, 52px); }
h2 { font-size: clamp(22px, 3.4vw, 34px); }
h3 { font-size: 20px; }
p { margin: 0 0 12px; }
.muted { color: var(--muted); font-size: 14px; }

.stack { display: grid; gap: 10px; }
.hero { padding: 26px; border-radius: 20px; background: linear-gradient(135deg, #ede9fe, #eef2ff 55%, #ffffff); border: 1px solid #ddd6fe; margin-bottom: 18px; }
.badge { display: inline-flex; align-items: center; border: 1px solid #d8b4fe; color: #5b21b6; background: #f5f3ff; border-radius: 999px; font-size: 12px; padding: 4px 10px; font-weight: 700; margin-bottom: 8px; }

.card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 18px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); }
.grid { display: grid; gap: 16px; }
.market-card { transition: transform .08s ease, box-shadow .2s ease; }
.market-card:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,.10); }
.market-city { font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; }

.btn { border: 0; border-radius: 10px; padding: 10px 14px; cursor: pointer; font-weight: 700; background: linear-gradient(135deg, var(--brand), var(--brand2)); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.btn.alt { background: #fff; color: var(--text); border: 1px solid var(--line); }

input, select, textarea { width: 100%; padding: 10px 11px; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; outline: none; }
input:focus, select:focus, textarea:focus { border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,.18); }
label { font-size: 13px; color: #475569; display: block; margin-bottom: 6px; font-weight: 600; }
label > input[type='checkbox'] { width: auto; margin-right: 8px; transform: translateY(1px); }

.topnav { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 18px; }
.topnav a { border: 1px solid var(--line); background: #fff; padding: 7px 11px; border-radius: 999px; font-size: 13px; color: #334155; }

table { width: 100%; border-collapse: collapse; background: #fff; }
th, td { padding: 10px; border-bottom: 1px solid #edf2f7; text-align: left; font-size: 14px; vertical-align: top; }
th { color: #475569; }
.kpi { font-size: 30px; font-weight: 800; }

@media (max-width: 900px) {
  form[style*='repeat(3'] { grid-template-columns: 1fr !important; }
  table { display: block; overflow-x: auto; }
}
`;
