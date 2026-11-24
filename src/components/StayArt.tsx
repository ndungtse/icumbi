const SKY: Record<string, [string, string]> = {
  hotel: ["#cfc4f2", "#f1edff"],
  guest_house: ["#ffd5c4", "#fff2ea"],
  hostel: ["#c3e8f0", "#effaff"],
  motel: ["#fbe3a0", "#fff7dc"],
  apartment: ["#d2d8f7", "#f0f2ff"],
  chalet: ["#c8ecd5", "#effaf2"],
  hut: ["#f4d6b0", "#fff0dc"],
};

const LIT = "#f6dc8c";
const DIM = "#8b72c4";

/** Windows in a grid: x, y of the first one, columns, rows, spacing. */
function windows(x: number, y: number, cols: number, rows: number, dx: number, dy: number, w = 8, h = 9) {
  return Array.from({ length: cols * rows }, (_, i) => (
    <rect key={i} x={x + (i % cols) * dx} y={y + Math.floor(i / cols) * dy} width={w} height={h} rx="1.5" fill={i % 3 === 1 ? DIM : LIT} />
  ));
}

const SCENES: Record<string, React.ReactNode> = {
  hotel: (
    <>
      <rect x="52" y="30" width="56" height="74" rx="3" fill="#4a2a8a" />
      {windows(60, 40, 3, 4, 16, 14)}
      <rect x="74" y="90" width="12" height="14" fill="#2a1a50" />
    </>
  ),
  guest_house: (
    <>
      <rect x="46" y="62" width="68" height="42" fill="#fff" />
      <polygon points="38,64 80,34 122,64" fill="#f26b4d" />
      <rect x="98" y="40" width="8" height="16" fill="#c9502f" />
      <rect x="72" y="80" width="16" height="24" rx="2" fill="#4a2a8a" />
      <rect x="54" y="72" width="12" height="12" rx="1.5" fill="#b9c7e8" />
      <rect x="94" y="72" width="12" height="12" rx="1.5" fill="#b9c7e8" />
    </>
  ),
  hostel: (
    <>
      <rect x="34" y="44" width="92" height="60" rx="3" fill="#2b7a8c" />
      {windows(42, 52, 5, 2, 17, 20, 10, 11)}
      <rect x="72" y="88" width="16" height="16" fill="#17434d" />
      <rect x="64" y="34" width="32" height="10" rx="2" fill="#f26b4d" />
    </>
  ),
  motel: (
    <>
      <rect x="22" y="66" width="116" height="38" fill="#8a5a3a" />
      <rect x="18" y="60" width="124" height="8" fill="#4a2a8a" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={32 + i * 26} y="78" width="12" height="26" rx="1.5" fill={LIT} />
      ))}
      <rect x="127" y="30" width="26" height="14" rx="3" fill="#f26b4d" />
      <rect x="138" y="44" width="4" height="22" fill="#4a2a8a" />
    </>
  ),
  apartment: (
    <>
      <rect x="34" y="38" width="42" height="66" fill="#3a3f7a" />
      <rect x="82" y="56" width="44" height="48" fill="#4a2a8a" />
      {windows(40, 46, 3, 4, 12, 14, 7, 8)}
      {windows(88, 64, 3, 3, 13, 14, 7, 8)}
    </>
  ),
  chalet: (
    <>
      <polygon points="22,104 34,70 46,104" fill="#1f4d36" />
      <polygon points="116,104 130,62 144,104" fill="#1f4d36" />
      <polygon points="48,104 80,42 112,104" fill="#2f6b4a" />
      <rect x="73" y="82" width="14" height="22" rx="2" fill={LIT} />
    </>
  ),
  hut: (
    <>
      <rect x="58" y="76" width="44" height="28" rx="3" fill="#c98f55" />
      <polygon points="50,78 80,42 110,78" fill="#8a5a2a" />
      <rect x="74" y="86" width="12" height="18" rx="6" fill="#3a2410" />
    </>
  ),
};

/** A small illustration of a lodging type, shown when a place has no photo. */
export function StayArt({ type }: { type: string }) {
  const kind = type in SCENES ? type : "hotel";
  const [top, bottom] = SKY[kind];
  return (
    <svg viewBox="0 0 160 128" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="160" height="128" fill={`url(#sky-${kind})`} />
      <circle cx="132" cy="26" r="12" fill="#fff" opacity=".7" />
      <path d="M0 98 Q32 70 64 90 T128 84 T160 92 V128 H0Z" fill="#17142b" opacity=".08" />
      <rect y="104" width="160" height="24" fill="#17142b" opacity=".1" />
      {SCENES[kind]}
    </svg>
  );
}
