import Link from "next/link";
import type { ReactNode } from "react";

type BrandSize = "header" | "hero" | "footer";

interface PricingPlan {
  name: string;
  desc: string;
  price: string;
  popular?: boolean;
  specs: ReadonlyArray<readonly [string, string]>;
  checks: readonly string[];
}

type Feature = readonly [icon: string, title: string, desc: string];
type ReviewRow = readonly [
  initial: string,
  name: string,
  role: string,
  quote: string,
];

const navItems: readonly string[] = [
  "產品",
  "Edge Regions",
  "價格",
  "文件中心",
  "最新動態",
];

const features: readonly Feature[] = [
  [
    "⚡",
    "極速性能",
    "NVMe SSD 儲存、最新硬體、毫秒級延遲，為您的應用提供最佳性能。",
  ],
  ["◎", "全球覆蓋", "40+ 數據中心遍佈全球，選擇最近的節點，降低延遲。"],
  ["◇", "安全可靠", "99.95% 正常運行時間、DDoS 防護、自動備份。"],
  ["≋", "高速網路", "1000 Mbps 起始頻寬，充足的流量配額。"],
  ["▣", "靈活配置", "按需選擇 CPU、記憶體、儲存，隨時調整配置。"],
  ["▤", "簡單易用", "直觀的控制面板、一鍵部署，完整的 API 支持。"],
];

const pricing: readonly PricingPlan[] = [
  {
    name: "基礎版",
    desc: "個人網站、開發測試、輕量應用",
    price: "$29.99",
    specs: [
      ["CPU", "4 vCPU"],
      ["記憶體", "8 GB"],
      ["儲存", "50 GB NVMe"],
      ["頻寬", "5000 GB/月"],
    ],
    checks: ["99.95% 正常運行時間", "DDoS 防護", "自動備份", "24/7 支援"],
  },
  {
    name: "專業版",
    desc: "中小企業、成長型應用",
    price: "$59.99",
    popular: true,
    specs: [
      ["CPU", "8 vCPU"],
      ["記憶體", "16 GB"],
      ["儲存", "100 GB NVMe"],
      ["頻寬", "10000 GB/月"],
    ],
    checks: [
      "99.95% 正常運行時間",
      "DDoS 防護",
      "自動備份",
      "優先支援",
      "免費 SSL 證書",
    ],
  },
  {
    name: "企業版",
    desc: "大型企業、高流量應用",
    price: "$119.99",
    specs: [
      ["CPU", "16 vCPU"],
      ["記憶體", "32 GB"],
      ["儲存", "200 GB NVMe"],
      ["頻寬", "20000 GB/月"],
    ],
    checks: [
      "99.99% 正常運行時間",
      "DDoS 防護",
      "自動備份",
      "專屬支援",
      "免費 SSL 證書",
      "負載均衡",
    ],
  },
];

const reviews: readonly ReviewRow[] = [
  [
    "張",
    "張偉",
    "技術長 / 電商平台",
    "Gridnix 的全球節點部署讓我們的應用在亞洲的延遲大幅降低，效果非常好。",
  ],
  [
    "李",
    "李明",
    "創辦人 / TechStart",
    "節點速度穩定，從選擇到部署 VPS 服務，整體體驗非常流暢。",
  ],
  [
    "王",
    "王小峰",
    "技術主管 / 遊戲公司",
    "作為遊戲後端，Gridnix 的低延遲讓玩家體驗提升明顯。",
  ],
  [
    "陳",
    "陳曉",
    "DevOps 工程師",
    "企業級的穩定性和安全性，我們已經在多個專案中使用 Gridnix。",
  ],
  [
    "劉",
    "劉洋",
    "後端工程師",
    "從台灣到全球各地的節點都非常快，API 也非常好用。",
  ],
  [
    "A",
    "Alex",
    "AI 工程師",
    "VPS 配置彈性高且價格合理，對比其他供應商性價比非常高。",
  ],
];

function BrandLogo({ size = "header" }: { size?: BrandSize }) {
  const width = size === "hero" ? 380 : size === "footer" ? 205 : 220;
  const height = size === "hero" ? 96 : size === "footer" ? 56 : 60;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 520 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block shrink-0"
      role="img"
      aria-label="Gridnix Distributed Edge Infrastructure"
    >
      <defs>
        <filter
          id={`softLogoShadow-${size}`}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.2"
            floodColor="#0B1220"
            floodOpacity="0.08"
          />
        </filter>
      </defs>
      <g filter={`url(#softLogoShadow-${size})`}>
        <rect x="0" y="8" width="25" height="25" rx="6" fill="#3D7BFF" />
        <rect x="41" y="8" width="25" height="25" rx="6" fill="#D7D9DE" />
        <rect x="82" y="8" width="25" height="25" rx="6" fill="#3D7BFF" />
        <rect x="0" y="49" width="25" height="25" rx="6" fill="#D7D9DE" />
        <rect x="41" y="49" width="25" height="25" rx="6" fill="#3D7BFF" />
        <rect x="82" y="49" width="25" height="25" rx="6" fill="#D7D9DE" />
        <rect x="0" y="90" width="25" height="25" rx="6" fill="#3D7BFF" />
        <rect x="41" y="90" width="25" height="25" rx="6" fill="#D7D9DE" />
        <rect x="82" y="90" width="25" height="25" rx="6" fill="#3D7BFF" />
      </g>
      <g transform="translate(145 18)">
        <text
          x="0"
          y="58"
          fill="#111827"
          fontSize="70"
          fontWeight="900"
          letterSpacing="-5.2"
          fontFamily="Arial Black, Eurostile, Microgramma, Rajdhani, system-ui, sans-serif"
          transform="scale(1.12 1)"
        >
          Gridni
        </text>
        <path d="M314 6 L334 6 L362 58 L342 58 Z" fill="#111827" />
        <path d="M315 58 L335 58 L361 6 L341 6 Z" fill="#111827" />
        <path d="M364 6 L384 6 L361 34 L348 34 Z" fill="#3D7BFF" />
        <path d="M348 58 L362 58 L385 34 L365 34 Z" fill="#3D7BFF" />
        <text
          x="0"
          y="104"
          fill="#6F747C"
          fontSize="15"
          fontWeight="500"
          letterSpacing="9.2"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
        >
          DISTRIBUTED EDGE INFRASTRUCTURE
        </text>
      </g>
    </svg>
  );
}

function Browser({
  path,
  scrollable,
  children,
}: {
  path: string;
  scrollable?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-slate-900/10">
      <div className="flex h-11 items-center gap-4 border-b border-slate-200 bg-[#F5F5F3] px-4">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="text-lg text-slate-400">‹ › ↻</div>
        <div className="mx-auto w-[520px] rounded-lg bg-white/80 py-1 text-center text-xs text-slate-500 shadow-inner">
          🔒 {path}
        </div>
        <div className="text-slate-400">⋮</div>
      </div>
      <div
        className={`${scrollable ? "h-[830px] overflow-y-auto" : "min-h-[690px]"} relative`}
      >
        {children}
      </div>
    </div>
  );
}

function Header({ current }: { current?: "home" | "login" | "verify" }) {
  return (
    <header className="relative z-10 flex h-[76px] items-center justify-between border-b border-white/50 bg-white/70 px-16 backdrop-blur-xl">
      <Link href="/" className="shrink-0">
        <BrandLogo />
      </Link>
      <nav className="hidden items-center gap-10 text-sm font-bold text-[#111827]/80 lg:flex">
        {navItems.map((item) => (
          <button key={item} type="button" className="hover:text-[#3D7BFF]">
            {item}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={`rounded-lg border px-6 py-2 text-sm font-bold ${current === "login" ? "border-[#3D7BFF] text-[#3D7BFF]" : "border-slate-200 bg-white text-[#111827]"}`}
        >
          登入
        </Link>
        <Link
          href="/login"
          className="rounded-lg bg-[#3D7BFF] px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
        >
          Deploy VPS
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  const cols: readonly (readonly string[])[] = [
    ["產品", "VPS 主機", "全球節點", "物件儲存", "負載平衡"],
    ["支援", "文件中心", "常見問題", "服務狀態", "技術支援"],
    ["公司", "關於我們", "最新動態", "合作夥伴", "聯絡我們"],
    ["法律", "隱私政策", "服務條款", "可接受使用政策"],
  ];
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/75 px-16 py-10 backdrop-blur-xl">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_3fr_1fr]">
        <div>
          <BrandLogo size="footer" />
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-500">
            全球邊緣基礎設施平台，助您建構更快、更安全、更可靠的應用體驗。
          </p>
          <div className="mt-4 flex gap-3 text-slate-500">
            <span>●</span>
            <span>◉</span>
            <span>in</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-8">
          {cols.map(([h, ...items]) => (
            <div key={h}>
              <div className="mb-4 text-sm font-black text-[#111827]">{h}</div>
              <div className="grid gap-3 text-sm text-slate-500">
                {items.map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="text-left hover:text-[#3D7BFF]"
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-end justify-end text-sm text-slate-500">
          © 2026 Gridnix. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function StackNumber({ value }: { value: string }) {
  const chars = String(value);
  const spans: ReactNode[] = [];
  for (let i = 0; i < chars.length; i++) {
    spans.push(
      <span
        key={`${value}-pos-${i}`}
        className="inline-block min-w-[0.72em] text-center animate-[numberFloat_1.8s_ease-in-out_infinite]"
        style={{ animationDelay: `${i * 90}ms` }}
      >
        {chars[i]}
      </span>,
    );
  }
  return (
    <div className="mt-1 flex items-end gap-1 overflow-hidden text-4xl font-black tracking-[0.18em] text-[#3D7BFF]">
      {spans}
    </div>
  );
}

function WorldMapPanel() {
  const nodes: ReadonlyArray<readonly [number, number]> = [
    [15, 34],
    [23, 48],
    [36, 30],
    [48, 42],
    [57, 32],
    [66, 47],
    [75, 39],
    [84, 58],
    [89, 44],
  ];
  return (
    <div className="relative mt-5 h-48 overflow-hidden rounded-lg bg-[linear-gradient(180deg,#16223a,#0b1220)]">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,.55) 1px, transparent 1.5px)",
          backgroundSize: "9px 9px",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 56"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M9 27 C16 10, 33 13, 39 25 S57 20, 64 27 S82 22, 93 33"
          fill="none"
          stroke="rgba(61,123,255,.28)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <path
          d="M18 38 C30 49, 40 42, 50 48 S72 41, 88 47"
          fill="none"
          stroke="rgba(61,123,255,.22)"
          strokeWidth="0.7"
          strokeDasharray="2 2"
        />
        <path
          d="M7 19 C20 21, 32 11, 43 19 C55 28, 61 13, 72 23 C81 32, 88 25, 96 31"
          fill="none"
          stroke="rgba(255,255,255,.13)"
          strokeWidth="0.6"
        />
        {nodes.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="1.1" fill="#3D7BFF" />
            <circle
              cx={x}
              cy={y}
              r="3.2"
              fill="none"
              stroke="rgba(61,123,255,.35)"
              strokeWidth="0.8"
              className="animate-ping"
            />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-2">
        {["US", "EU", "HK", "SG"].map((r) => (
          <div
            key={r}
            className="rounded bg-white/5 px-2 py-1 text-center text-[10px] font-bold text-blue-100"
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6 mt-12 text-center">
      <h2 className="text-3xl font-black text-[#111827]">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function Info({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-5 rounded-xl border border-slate-100 bg-white/90 p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl text-[#3D7BFF]">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-[#111827]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function Price({ p }: { p: PricingPlan }) {
  return (
    <div
      className={`relative rounded-xl border bg-white p-6 shadow-sm ${p.popular ? "border-[#3D7BFF]" : "border-slate-200"}`}
    >
      {p.popular && (
        <span className="absolute right-5 top-5 rounded bg-[#3D7BFF] px-2 py-1 text-xs font-black text-white">
          熱門
        </span>
      )}
      <h3 className="text-xl font-black text-[#111827]">{p.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
      <div className="mt-5 text-4xl font-black text-[#3D7BFF]">
        {p.price}
        <span className="ml-1 text-sm text-slate-500">/月</span>
      </div>
      <div className="mt-5 grid gap-2 border-b border-slate-200 pb-4 text-sm">
        {p.specs.map(([a, b]) => (
          <div key={a} className="flex justify-between">
            <span className="text-slate-500">{a}</span>
            <b>{b}</b>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        {p.checks.map((c) => (
          <div key={c}>✓ {c}</div>
        ))}
      </div>
      <Link
        href="/login"
        className={`mt-5 block w-full rounded-lg py-3 text-center text-sm font-black ${p.popular ? "bg-[#3D7BFF] text-white" : "border border-slate-200 bg-white"}`}
      >
        選擇此方案
      </Link>
    </div>
  );
}

function Review({ t }: { t: ReviewRow }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/90 p-5 shadow-sm">
      <div className="text-yellow-400">★★★★★</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">“{t[3]}”</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3D7BFF] text-sm font-black text-white">
          {t[0]}
        </div>
        <div>
          <b className="text-sm text-[#111827]">{t[1]}</b>
          <div className="text-xs text-slate-500">{t[2]}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Browser path="gridnix.com" scrollable>
      <div className="relative min-h-full bg-[#F5F5F5]">
        <Header current="home" />
        <main className="relative z-10 px-16 py-10">
          <section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <BrandLogo size="hero" />
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#111827]">
                全球分布式 Edge VPS 平台
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                我們將雲能力部署到全球邊緣節點，為您提供極致效能與最穩定的 VPS
                服務。
              </p>
              <div className="mt-7 flex gap-4">
                <Link
                  href="/login"
                  className="rounded-lg bg-[#3D7BFF] px-7 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20"
                >
                  立即部署 VPS →
                </Link>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-7 py-3 text-sm font-black text-[#111827]"
                >
                  ● 所有系統運行正常
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-[#111827] p-5 text-white shadow-2xl shadow-slate-900/20">
              <div className="flex items-center justify-between">
                <b>全球 Edge 節點</b>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                  ● 所有系統正常
                </span>
              </div>
              <WorldMapPanel />
              <div className="mt-4 grid grid-cols-4 gap-3">
                {(
                  [
                    ["總站點數", "42"],
                    ["可用區域", "18"],
                    ["覆蓋國家", "28"],
                    ["網路品質", "優秀"],
                  ] as const
                ).map(([a, b]) => (
                  <div key={a} className="rounded-lg bg-white/10 p-3">
                    <div className="text-xs text-slate-300">{a}</div>
                    <div className="mt-1 text-2xl font-black">{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-8 flex rounded-xl border border-slate-100 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
            {(
              [
                ["042+", "Global Edge", "邊緣節點"],
                ["99.92%", "Uptime", "服務可用性"],
                ["10.3", "Backbone", "Tbps 骨幹網路"],
              ] as const
            ).map(([v, l, d]) => (
              <div
                key={l}
                className="flex flex-1 items-center justify-center gap-5 border-r border-slate-200 last:border-r-0"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E9EDF2] text-2xl text-[#3D7BFF]">
                  ◎
                </div>
                <div>
                  <div className="text-sm font-black text-[#3D7BFF]">{l}</div>
                  <StackNumber value={v} />
                  <div className="mt-1 text-xs text-slate-500">{d}</div>
                </div>
              </div>
            ))}
          </section>
          <SectionTitle
            title="為什麼選擇 Gridnix？"
            sub="我們提供業界領先的性能、可靠性和支持"
          />
          <section className="grid gap-4 lg:grid-cols-3">
            {features.map(([icon, title, desc]) => (
              <Info key={title} icon={icon} title={title} desc={desc} />
            ))}
          </section>
          <SectionTitle
            title="簡單透明的定價"
            sub="即開即用的 VPS 方案，隨時升級配置"
          />
          <section className="grid gap-6 lg:grid-cols-3">
            {pricing.map((p) => (
              <Price key={p.name} p={p} />
            ))}
          </section>
          <SectionTitle
            title="客戶信賴的選擇"
            sub="加入數萬位開發者、企業的行列，體驗全球邊緣基礎設施的力量"
          />
          <section className="grid gap-4 lg:grid-cols-3">
            {reviews.map((t) => (
              <Review key={t[1]} t={t} />
            ))}
          </section>
          <section className="mt-10 rounded-2xl border border-slate-100 bg-white/90 p-8 text-center shadow-lg shadow-slate-900/5">
            <h2 className="text-3xl font-black text-[#111827]">
              準備開始了嗎？
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              立即部署全球邊緣節點 VPS，享受卓越效能體驗
            </p>
            <div className="mt-5 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-[#3D7BFF] px-8 py-3 font-black text-white"
              >
                立即部署 →
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-8 py-3 font-black"
              >
                已有帳戶？登入
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </Browser>
  );
}
