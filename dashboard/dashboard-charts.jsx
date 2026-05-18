// Chart primitives — minimal SVG, no deps.
// Exposes: LineChart, BarChart, Heatmap, Sparkline, Donut, AreaStack, fmtBRL, fmtCompact, fmtPct.

(function () {
  const { useMemo, useState } = React;

  // ===== Formatters =====
  function fmtBRL(v) {
    if (v == null || isNaN(v)) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }
  function fmtCompact(v, opts = {}) {
    if (v == null || isNaN(v)) return "—";
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    const dig = (opts.dig != null) ? opts.dig : 1;
    if (abs >= 1e9) return sign + (abs/1e9).toFixed(dig) + "B";
    if (abs >= 1e6) return sign + (abs/1e6).toFixed(dig) + "M";
    if (abs >= 1e3) return sign + (abs/1e3).toFixed(dig) + "k";
    return sign + abs.toFixed(0);
  }
  function fmtPct(v, dig = 1) {
    if (v == null || isNaN(v)) return "—";
    return (v * 100).toFixed(dig) + "%";
  }
  function fmtMonthShort(m) {
    if (!m || typeof m !== "string") return m;
    const [y, mo] = m.split("-");
    const names = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    return `${names[+mo - 1]}/${y.slice(2)}`;
  }

  // ===== Line / Area chart =====
  function LineChart({
    data, series, width = 720, height = 220, x = "month",
    colors, yFormat = fmtCompact, padding = { l: 44, r: 12, t: 16, b: 32 },
    zero = true, smooth = false, dotted = [], showDots = false, area = false,
  }) {
    const [hover, setHover] = useState(null);
    const pad = padding;
    const w = width, h = height;
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;

    const seriesArr = series.map((s, idx) => ({
      key: s.key, label: s.label,
      color: (colors && colors[idx]) || s.color || "#1c1917",
      values: data.map(d => +d[s.key] || 0),
    }));

    const allVals = seriesArr.flatMap(s => s.values);
    let yMin = Math.min(...allVals, zero ? 0 : Infinity);
    let yMax = Math.max(...allVals, 0);
    if (yMin === yMax) yMax += 1;
    const yRange = yMax - yMin;

    const xCount = data.length;
    const xStep = iw / Math.max(1, xCount - 1);

    function px(i) { return pad.l + i * xStep; }
    function py(v) { return pad.t + ih - ((v - yMin) / yRange) * ih; }

    // Y ticks
    const tickCount = 4;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const v = yMin + (yRange * i) / tickCount;
      ticks.push({ v, y: py(v) });
    }

    // X tick indices (every Nth)
    const xTickStep = Math.max(1, Math.round(xCount / 8));
    const xTicks = data.map((d, i) => ({ d, i, x: px(i) })).filter(t => t.i % xTickStep === 0 || t.i === xCount - 1);

    const linePath = (vals) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
    const areaPath = (vals) => {
      const top = vals.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
      return `${top} L${px(xCount-1).toFixed(1)},${py(yMin).toFixed(1)} L${px(0).toFixed(1)},${py(yMin).toFixed(1)} Z`;
    };

    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}
           onMouseLeave={() => setHover(null)}>
        {/* grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={t.y} y2={t.y} stroke="#e7e5e4" strokeWidth="1" />
            <text x={pad.l - 6} y={t.y + 3.5} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="#a8a29e">
              {yFormat(t.v, { dig: 1 })}
            </text>
          </g>
        ))}
        {/* x axis */}
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={h - 10} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="#a8a29e">
            {fmtMonthShort(t.d[x])}
          </text>
        ))}
        {/* areas */}
        {area && seriesArr.map((s, idx) => (
          <path key={"a-"+idx} d={areaPath(s.values)} fill={s.color} opacity="0.06" />
        ))}
        {/* lines */}
        {seriesArr.map((s, idx) => {
          const isDot = dotted.includes(s.key);
          return (
            <path key={"l-"+idx} d={linePath(s.values)} fill="none" stroke={s.color}
              strokeWidth="1.6"
              strokeDasharray={isDot ? "3 3" : undefined} />
          );
        })}
        {/* dots optional */}
        {showDots && seriesArr.map((s, idx) =>
          s.values.map((v, i) => (
            <circle key={`d-${idx}-${i}`} cx={px(i)} cy={py(v)} r="2.5" fill={s.color} />
          ))
        )}
        {/* hover band */}
        {data.map((d, i) => (
          <rect key={"hb-"+i} x={px(i) - xStep/2} y={pad.t} width={xStep} height={ih}
            fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <g>
            <line x1={px(hover)} x2={px(hover)} y1={pad.t} y2={pad.t + ih} stroke="#1c1917" strokeWidth="1" opacity="0.4" />
            {seriesArr.map((s, idx) => (
              <circle key={"h-"+idx} cx={px(hover)} cy={py(s.values[hover])} r="3.5" fill="#fff" stroke={s.color} strokeWidth="1.6" />
            ))}
          </g>
        )}
        {/* tooltip */}
        {hover !== null && (() => {
          const tx = Math.min(w - 160, Math.max(0, px(hover) + 8));
          const ty = pad.t + 4;
          return (
            <g transform={`translate(${tx} ${ty})`}>
              <rect width="156" height={18 + seriesArr.length * 16} rx="4" fill="#1c1917" />
              <text x="10" y="13" fontSize="10" fontFamily="var(--font-mono)" fill="#d6d3d1" letterSpacing="0.04em">
                {fmtMonthShort(data[hover][x]).toUpperCase()}
              </text>
              {seriesArr.map((s, i) => (
                <g key={"t-"+i} transform={`translate(0 ${18 + i*16})`}>
                  <rect x="10" y="-7" width="8" height="8" fill={s.color} rx="1.5" />
                  <text x="22" y="0" fontSize="10.5" fill="#fafaf9">{s.label}</text>
                  <text x="146" y="0" fontSize="11" fontFamily="var(--font-mono)" textAnchor="end" fill="#fff" fontWeight="600">
                    {fmtCompact(s.values[hover])}
                  </text>
                </g>
              ))}
            </g>
          );
        })()}
      </svg>
    );
  }

  // ===== Horizontal bar list =====
  function HBars({ data, labelKey = "label", valueKey = "value", color = "#1c1917", max, height = 22, gap = 8, formatVal = fmtCompact, rightMeta }) {
    const computedMax = (max != null ? max : Math.max(...data.map(d => Math.abs(+d[valueKey] || 0)))) || 1;
    return (
      <div style={{ display: "grid", gap }}>
        {data.map((d, i) => {
          const v = +d[valueKey] || 0;
          const pct = (Math.abs(v) / computedMax) * 100;
          const c = typeof color === "function" ? color(d, i) : color;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11.5, color: "var(--ink-2)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360 }}>{d[labelKey]}</span>
                  {rightMeta && <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-4)", fontSize: 10.5 }}>{rightMeta(d)}</span>}
                </div>
                <div className="bar-track" style={{ height: 5 }}>
                  <div className="bar-fill" style={{ width: pct + "%", background: c }} />
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink)" }}>
                {formatVal(v)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ===== Sparkline =====
  function Sparkline({ values, width = 80, height = 22, color = "#1c1917", zero = true }) {
    if (!values || values.length === 0) return null;
    const min = Math.min(...values, zero ? 0 : Infinity);
    const max = Math.max(...values, 0);
    const range = max - min || 1;
    const step = width / Math.max(1, values.length - 1);
    const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${(i*step).toFixed(1)},${(height - ((v - min)/range) * height).toFixed(1)}`).join(" ");
    return (
      <svg className="spark-c" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={d} fill="none" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }

  // ===== Heatmap =====
  function Heatmap({ rows, months, getValue, getLabel, getMeta, maxAbs, cellW = 28, cellH = 22, palette = "ink" }) {
    const allVals = rows.flatMap(r => months.map(m => Math.abs(getValue(r, m) || 0)));
    const m = maxAbs ?? Math.max(...allVals, 1);
    // Color: monochrome ink scale
    function cellColor(v) {
      if (!v || v === 0) return "#fafaf9";
      const t = Math.min(1, Math.sqrt(Math.abs(v) / m));
      if (palette === "red") {
        return `rgba(185, 28, 28, ${0.08 + t * 0.85})`;
      }
      if (palette === "blue") {
        return `rgba(29, 78, 216, ${0.08 + t * 0.85})`;
      }
      if (palette === "amber") {
        return `rgba(180, 83, 9, ${0.06 + t * 0.85})`;
      }
      if (palette === "green") {
        return `rgba(21, 128, 61, ${0.06 + t * 0.85})`;
      }
      if (palette === "violet") {
        return `rgba(109, 40, 217, ${0.06 + t * 0.85})`;
      }
      return `rgba(28, 25, 23, ${0.06 + t * 0.85})`;
    }
    return (
      <div className="scroll-x">
        <table className="tbl" style={{ minWidth: 100 + months.length * cellW }}>
          <thead>
            <tr>
              <th style={{ minWidth: 260, position: "sticky", left: 0, background: "var(--surface-2)", zIndex: 2 }}>Fornec./Cliente</th>
              {months.map(m => (
                <th key={m} className="r" style={{ minWidth: cellW, padding: "10px 2px", fontSize: 9.5 }}>{fmtMonthShort(m)}</th>
              ))}
              <th className="r" style={{ minWidth: 60 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => {
              const total = months.reduce((s, m) => s + (getValue(r, m) || 0), 0);
              return (
                <tr key={ri}>
                  <td style={{ position: "sticky", left: 0, background: "var(--surface)", zIndex: 1 }}>
                    <div className="strong" style={{ fontSize: 12 }}>{getLabel(r)}</div>
                    {getMeta && <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{getMeta(r)}</div>}
                  </td>
                  {months.map(m => {
                    const v = getValue(r, m) || 0;
                    const bg = cellColor(v);
                    const t = Math.min(1, Math.sqrt(Math.abs(v) / m));
                    const textColor = t > 0.5 ? "#fff" : "var(--ink-3)";
                    return (
                      <td key={m} className="r" style={{ padding: "2px 2px", textAlign: "center" }}>
                        <div className="hm-cell" style={{
                          background: bg, color: v ? textColor : "var(--ink-5)",
                          height: cellH - 4, lineHeight: (cellH - 4) + "px",
                          borderRadius: 2, fontSize: 9.5,
                        }} title={`${getLabel(r)} · ${fmtMonthShort(m)} · ${fmtBRL(v)}`}>
                          {v ? fmtCompact(v, { dig: 0 }) : "·"}
                        </div>
                      </td>
                    );
                  })}
                  <td className="r" style={{ fontWeight: 600, color: "var(--ink)" }}>{fmtCompact(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ===== Donut =====
  function Donut({ data, size = 160, thickness = 22, valueKey = "value", labelKey = "label" }) {
    const total = data.reduce((s, d) => s + (+d[valueKey] || 0), 0);
    let acc = 0;
    const r = (size - thickness) / 2;
    const c = size / 2;
    return (
      <svg width={size} height={size}>
        {data.map((d, i) => {
          const v = +d[valueKey] || 0;
          const startA = (acc / total) * Math.PI * 2 - Math.PI / 2;
          acc += v;
          const endA = (acc / total) * Math.PI * 2 - Math.PI / 2;
          const x1 = c + r * Math.cos(startA);
          const y1 = c + r * Math.sin(startA);
          const x2 = c + r * Math.cos(endA);
          const y2 = c + r * Math.sin(endA);
          const large = endA - startA > Math.PI ? 1 : 0;
          const color = d.color || `hsl(${i*50}, 5%, ${30 + i*8}%)`;
          return (
            <path key={i} d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`}
                  stroke={color} strokeWidth={thickness} fill="none" />
          );
        })}
      </svg>
    );
  }

  // ===== Stacked bar (vertical) =====
  function StackBars({ data, series, x = "month", width = 720, height = 220, padding = { l: 44, r: 12, t: 16, b: 32 } }) {
    const pad = padding;
    const w = width, h = height;
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const totals = data.map(d => series.reduce((s, sr) => s + Math.max(0, +d[sr.key] || 0), 0));
    const yMax = Math.max(...totals, 1);
    const xCount = data.length;
    const bw = (iw / xCount) * 0.7;
    function px(i) { return pad.l + (iw / xCount) * (i + 0.5); }
    function py(v) { return pad.t + ih - (v / yMax) * ih; }
    const tickCount = 4;
    const ticks = Array.from({length: tickCount + 1}, (_, i) => yMax * (i / tickCount));
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w-pad.r} y1={py(v)} y2={py(v)} stroke="#e7e5e4" />
            <text x={pad.l - 6} y={py(v) + 3.5} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="#a8a29e">
              {fmtCompact(v)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          let acc = 0;
          return (
            <g key={i}>
              {series.map((s, si) => {
                const v = Math.max(0, +d[s.key] || 0);
                const y0 = py(acc); const y1 = py(acc + v);
                acc += v;
                return (
                  <rect key={si} x={px(i) - bw/2} y={y1} width={bw} height={Math.max(0, y0 - y1)} fill={s.color} />
                );
              })}
            </g>
          );
        })}
        {data.map((d, i) => i % Math.ceil(xCount/8) === 0 && (
          <text key={"x"+i} x={px(i)} y={h - 10} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="#a8a29e">
            {fmtMonthShort(d[x])}
          </text>
        ))}
      </svg>
    );
  }

  Object.assign(window, {
    LineChart, HBars, Sparkline, Heatmap, Donut, StackBars,
    fmtBRL, fmtCompact, fmtPct, fmtMonthShort,
  });
})();
