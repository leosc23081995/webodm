// Shared SVG icons & illustrations for Mindray flow — blueprint style
// All icons use stroke-based rendering. Default size 24, override via props.

const Ic = ({ children, size = 24, stroke = "currentColor", fill = "none", ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);

window.BPIcons = {
  // Stage 1
  users: (p) => <Ic {...p}><circle cx="8" cy="9" r="3" /><path d="M2 20c0-3 2.7-5 6-5s6 2 6 5" /><circle cx="17" cy="10" r="2.5" /><path d="M14 20c0-2 2-3.5 3-3.5s5 1 5 3.5" /></Ic>,
  hospital: (p) => <Ic {...p}><rect x="3" y="6" width="18" height="15" /><path d="M12 9v6M9 12h6" /><path d="M7 21v-4M17 21v-4" /><path d="M9 6V3h6v3" /></Ic>,
  home: (p) => <Ic {...p}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" /></Ic>,
  urgent: (p) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></Ic>,
  stat: (p) => <Ic {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Ic>,

  // Stage 2/3
  clipboard: (p) => <Ic {...p}><rect x="5" y="4" width="14" height="18" rx="1" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M8 11h8M8 14h8M8 17h5" /></Ic>,
  barcode: (p) => <Ic {...p}><path d="M3 5v14M5 5v14M7 5v14M10 5v14M13 5v14M16 5v14M18 5v14M20 5v14" strokeWidth="1.1" /></Ic>,
  batch: (p) => <Ic {...p}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></Ic>,
  diamond: (p) => <Ic {...p}><path d="M12 2l10 10-10 10L2 12 12 2z" /></Ic>,
  check: (p) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></Ic>,
  cross: (p) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></Ic>,
  alert: (p) => <Ic {...p}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18v.5" /></Ic>,

  // Stage 4
  rfid: (p) => <Ic {...p}><path d="M5 8c2 2 2 6 0 8M9 6c4 3 4 9 0 12M13 4c6 4 6 12 0 16" /></Ic>,
  scan: (p) => <Ic {...p}><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><path d="M3 12h18" /></Ic>,
  bulk: (p) => <Ic {...p}><rect x="3" y="3" width="6" height="18" rx="1" /><rect x="11" y="3" width="6" height="18" rx="1" /><rect x="19" y="3" width="2" height="18" rx="1" /></Ic>,
  uncap: (p) => <Ic {...p}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M8 8h8v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8z" /><path d="M8 4l-3-2M16 4l3-2" /></Ic>,
  sort: (p) => <Ic {...p}><path d="M3 6h18M6 12h12M9 18h6" /></Ic>,
  route: (p) => <Ic {...p}><circle cx="5" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M5 8v4a4 4 0 004 4h6" /></Ic>,
  register: (p) => <Ic {...p}><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M7 13h6M7 16h10" /></Ic>,
  archive: (p) => <Ic {...p}><rect x="3" y="3" width="18" height="5" /><path d="M5 8v13h14V8M10 12h4" /></Ic>,

  // Stage 6 middleware
  trend: (p) => <Ic {...p}><path d="M3 17l6-6 4 4 8-9" /><path d="M14 6h7v7" /></Ic>,
  branch: (p) => <Ic {...p}><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 7v10M8 5h6a4 4 0 014 4v0M8 19h6a4 4 0 004-4v0" /></Ic>,
  refresh: (p) => <Ic {...p}><path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" /></Ic>,
  user: (p) => <Ic {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Ic>,
  gauge: (p) => <Ic {...p}><path d="M3 17a9 9 0 0118 0" /><path d="M12 17l4-6" /><circle cx="12" cy="17" r="1.5" /></Ic>,
  panel: (p) => <Ic {...p}><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M9 9v11" /><path d="M12 13h6M12 16h4" /></Ic>,
  dna: (p) => <Ic {...p}><path d="M7 3c4 4 6 6 10 10 4 4 0 0 0 0M17 3c-4 4-6 6-10 10-4 4 0 0 0 0" /><path d="M8 5h8M8 19h8M9.5 9h5M9.5 15h5" /></Ic>,

  // Stage 7
  magnifier: (p) => <Ic {...p}><circle cx="11" cy="11" r="6" /><path d="M16 16l5 5" /><path d="M9 11h4M11 9v4" /></Ic>,
  doctor: (p) => <Ic {...p}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-4 3-6 7-6s7 2 7 6" /><path d="M11 12v3M9.5 13.5h3" /></Ic>,
  docCheck: (p) => <Ic {...p}><path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z" /><path d="M14 3v5h5" /><path d="M8 14l3 3 5-6" /></Ic>,
  cloud: (p) => <Ic {...p}><path d="M7 17a4 4 0 010-8 5 5 0 019-1 4 4 0 012 8H7z" /><path d="M12 13v5M9.5 15.5l2.5 2.5 2.5-2.5" /></Ic>,
  fridge: (p) => <Ic {...p}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M5 10h14" /><path d="M8 6v2M8 13v3" /></Ic>,
  biohazard: (p) => <Ic {...p}><circle cx="12" cy="12" r="3" /><path d="M12 4a4 4 0 014 4M12 4a4 4 0 00-4 4M6 18a4 4 0 014-4M18 18a4 4 0 00-4-4" /></Ic>,

  // Special rules
  timer: (p) => <Ic {...p}><circle cx="12" cy="13" r="8" /><path d="M9 2h6M12 9v4l3 2" /></Ic>,
  alertTube: (p) => <Ic {...p}><path d="M8 3h8v15a4 4 0 01-8 0V3z" /><path d="M8 8h8" /><path d="M12 11v3M12 17v.5" /></Ic>,
  microscope: (p) => <Ic {...p}><path d="M6 21h12" /><path d="M9 18a7 7 0 008-7" /><path d="M11 4l5 5-3 3-5-5 3-3z" /><path d="M8 14l-2 2 2 2 2-2-2-2z" /></Ic>,
  redo: (p) => <Ic {...p}><path d="M3 12a9 9 0 1015-6.7M21 5v5h-5" /></Ic>,

  // Misc
  arrowRight: (p) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ic>,
  arrowDown: (p) => <Ic {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Ic>,
  plus: (p) => <Ic {...p}><path d="M12 5v14M5 12h14" /></Ic>,
  minus: (p) => <Ic {...p}><path d="M5 12h14" /></Ic>,
  filter: (p) => <Ic {...p}><path d="M3 5h18l-7 9v5l-4 2v-7L3 5z" /></Ic>,
  info: (p) => <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></Ic>,
  power: (p) => <Ic {...p}><path d="M12 3v9" /><path d="M7 6a8 8 0 1010 0" /></Ic>,
  conveyor: (p) => <Ic {...p}><rect x="2" y="14" width="20" height="4" rx="2" /><circle cx="6" cy="16" r="0.8" fill="currentColor" /><circle cx="12" cy="16" r="0.8" fill="currentColor" /><circle cx="18" cy="16" r="0.8" fill="currentColor" /><rect x="8" y="8" width="3" height="6" /><rect x="14" y="6" width="3" height="8" /></Ic>,
};

// Test tube SVG — color customizable
window.BPTube = function Tube({ color = "#7A4DBD", capColor = "#6B3FAD", level = 0.7, size = 24, label, glowing = false }) {
  const h = size * 2;
  const w = size * 0.7;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`tube-fill-${color.replace("#","")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="1" stopColor={color} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      {/* cap */}
      <rect x="2" y="0" width={w - 4} height={size * 0.32} rx="1.5" fill={capColor} />
      <rect x="2" y={size * 0.28} width={w - 4} height="2" fill={capColor} opacity="0.4" />
      {/* tube body */}
      <path d={`M3 ${size * 0.34} L3 ${h - w * 0.5} A ${(w-6)/2} ${(w-6)/2} 0 0 0 ${w-3} ${h - w * 0.5} L ${w-3} ${size * 0.34} Z`}
        fill="rgba(15, 30, 55, 0.6)" stroke="rgba(180, 210, 240, 0.4)" strokeWidth="0.8" />
      {/* liquid */}
      <clipPath id={`tube-clip-${color.replace("#","")}`}>
        <path d={`M4 ${size * 0.34} L4 ${h - w * 0.5} A ${(w-8)/2} ${(w-8)/2} 0 0 0 ${w-4} ${h - w * 0.5} L ${w-4} ${size * 0.34} Z`} />
      </clipPath>
      <g clipPath={`url(#tube-clip-${color.replace("#","")})`}>
        <rect x="0" y={h - (h - size * 0.34) * level - w * 0.1} width={w} height={h} fill={`url(#tube-fill-${color.replace("#","")})`} />
      </g>
      {/* highlight */}
      <rect x="5" y={size * 0.4} width="1.2" height={h - size * 0.5} fill="rgba(255,255,255,0.18)" rx="0.6" />
      {glowing && <circle cx={w/2} cy={h - w * 0.5} r={w * 0.5} fill={color} opacity="0.18" className="bp-pulse" />}
      {label && (
        <text x={w/2} y={h - w * 0.45} textAnchor="middle" fill="white" fontSize={w * 0.4} fontFamily="var(--font-mono)" fontWeight="600">{label}</text>
      )}
    </svg>
  );
};

// Mindray analyzer placeholder illustration
window.BPAnalyzer = function Analyzer({ width = 280, height = 160, label = "TM-1000 / MT 8000", variant = "mt8000" }) {
  return (
    <svg viewBox="0 0 280 160" width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="anal-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e8f1ff" />
          <stop offset="1" stopColor="#a8c0e0" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="140" cy="148" rx="100" ry="4" fill="rgba(0,0,0,0.35)" />
      {/* main body */}
      <rect x="40" y="30" width="200" height="110" rx="3" fill="url(#anal-body)" stroke="#456" strokeWidth="0.8" />
      {/* side modules */}
      <rect x="20" y="50" width="22" height="80" rx="2" fill="#cdd8e6" stroke="#456" strokeWidth="0.5" />
      <rect x="238" y="50" width="22" height="80" rx="2" fill="#cdd8e6" stroke="#456" strokeWidth="0.5" />
      {/* display panel */}
      <rect x="55" y="42" width="80" height="34" rx="2" fill="#0a2540" stroke="#456" strokeWidth="0.5" />
      <rect x="58" y="46" width="74" height="2" fill="#5ee0ff" opacity="0.8" />
      <rect x="58" y="52" width="50" height="1.5" fill="#5ee0ff" opacity="0.6" />
      <rect x="58" y="56" width="64" height="1.5" fill="#5ee0ff" opacity="0.4" />
      <rect x="58" y="60" width="40" height="1.5" fill="#ffb454" opacity="0.7" />
      <rect x="58" y="64" width="54" height="1.5" fill="#5ee0ff" opacity="0.4" />
      <rect x="58" y="68" width="30" height="1.5" fill="#5fdc92" opacity="0.7" />
      {/* logo */}
      <text x="150" y="60" fill="#0066b3" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">mindray</text>
      <text x="150" y="74" fill="#345" fontSize="9" fontFamily="var(--font-mono)">{label.split(" / ")[1] || label}</text>
      {/* control buttons */}
      <circle cx="155" cy="90" r="2.5" fill="#5fdc92" />
      <circle cx="165" cy="90" r="2.5" fill="#ffb454" />
      <circle cx="175" cy="90" r="2.5" fill="#cdd8e6" stroke="#456" strokeWidth="0.4" />
      {/* tube ports */}
      <g transform="translate(150 105)">
        {[0,1,2,3,4,5,6,7].map(i => (
          <g key={i} transform={`translate(${i * 9} 0)`}>
            <rect x="0" y="0" width="6" height="10" rx="0.8" fill="#0a2540" />
            <rect x="1.5" y="-3" width="3" height="3" rx="0.5" fill={["#7A4DBD","#2B6CB0","#D69E2E","#C53030","#718096","#D4A017","#2F855A","#7A4DBD"][i]} />
          </g>
        ))}
      </g>
      {/* feet */}
      <rect x="50" y="138" width="6" height="6" fill="#456" />
      <rect x="224" y="138" width="6" height="6" fill="#456" />
    </svg>
  );
};

// Centrifuge illustration
window.BPCentrifuge = function Centrifuge({ size = 60 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <rect x="6" y="10" width="48" height="44" rx="3" fill="#cdd8e6" stroke="#456" strokeWidth="0.6" />
      <circle cx="30" cy="32" r="14" fill="#0a2540" stroke="#456" strokeWidth="0.5" />
      <circle cx="30" cy="32" r="9" fill="none" stroke="#5ee0ff" strokeWidth="0.6" strokeDasharray="2 2" className="bp-pulse" />
      <circle cx="30" cy="32" r="2" fill="#5ee0ff" />
      <rect x="22" y="14" width="16" height="3" rx="0.5" fill="#0a2540" />
      <circle cx="46" cy="48" r="1.5" fill="#5fdc92" />
    </svg>
  );
};
