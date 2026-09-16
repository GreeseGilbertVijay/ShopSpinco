import type { Metadata } from 'next';
import Link from 'next/link';
import ProcessTechnologyNavbar from '@/components/ProcessTechnologyNavbar';
import RotatingCircle from '@/components/RotatingCircle';
import Avatar from '@/components/Avatar';
import StackedServiceCards from '@/components/StackedServiceCards';
import TrustedByFan from '@/components/TrustedByFan';


export const metadata: Metadata = {
  title: 'Process & Technology · ShopSpinco',
  description: 'A look at the freeze-dry process technology and engineering work behind ShopSpinco.',
  robots: { index: false, follow: false },
};

type WorkTile = {
  label: string;
  sub: string;
  gradient: string;
  icon: React.ReactNode;
};

function SnowflakeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M12 2l-2 2M12 2l2 2M12 22l-2-2M12 22l2-2" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15l4-5" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ThermometerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0Z" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8M12 13v8" />
    </svg>
  );
}
function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6M10 3v6.5L4.8 18a1.6 1.6 0 0 0 1.4 2.4h11.6a1.6 1.6 0 0 0 1.4-2.4L14 9.5V3" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21c9 0 14-5 14-14V5h-2C8 5 5 10 5 19v2Z" />
      <path d="M5 21c0-6 3-10 8-13" />
    </svg>
  );
}

const workTiles: WorkTile[] = [
  { label: 'Vacuum Chamber', sub: 'Equipment', gradient: 'from-indigo-500 to-indigo-700', icon: <SnowflakeIcon /> },
  { label: 'IQF Tunnel', sub: 'Process Line', gradient: 'from-accent to-accent-hover', icon: <ThermometerIcon /> },
  { label: 'Blast Freezer', sub: 'Cold Chain', gradient: 'from-emerald-500 to-emerald-700', icon: <GaugeIcon /> },
  { label: 'Control Panel', sub: 'Automation', gradient: 'from-rose-500 to-rose-700', icon: <FlaskIcon /> },
  { label: 'Packaging Cell', sub: 'Line Design', gradient: 'from-amber-600 to-amber-800', icon: <BoxIcon /> },
  { label: 'Lab QC', sub: 'Quality', gradient: 'from-sky-500 to-sky-700', icon: <LeafIcon /> },
  { label: 'Cold Storage', sub: 'Warehousing', gradient: 'from-violet-500 to-violet-700', icon: <BoxIcon /> },
 
];

const CARD_SIZE = 200;
const CARD_GAP = 72;
// radius that keeps adjacent card edges CARD_GAP apart along the ring
const CIRCLE_RADIUS = Math.round((CARD_SIZE + CARD_GAP) / (2 * Math.sin(Math.PI / workTiles.length)));

function getCirclePosition(index: number, total: number) {
  const angle = (360 / total) * index - 120;
  const radians = (angle * Math.PI) / 180;
  return { angle, x: Math.round(Math.cos(radians) * CIRCLE_RADIUS), y: Math.round(Math.sin(radians) * CIRCLE_RADIUS) };
}

function WorkTileCard({ tile, index }: { tile: WorkTile; index: number }) {
  const { x, y, angle } = getCirclePosition(index, workTiles.length);
  // tilt each card so its bottom edge (where the label sits) faces the shared
  // center, as if gravity were pulling it toward the "Our Work" hub — flipped
  // 180deg on the lower half of the ring so labels never render upside-down
  let rotation = Math.round(angle + 90);
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized > 90 && normalized < 270) rotation += 180;

  return (
    <div
      className={`hidden lg:flex absolute top-1/2 left-1/2 flex-col items-center justify-end text-center gap-2 rounded-2xl p-4 bg-gradient-to-br ${tile.gradient} text-white shadow-lifted cursor-pointer`}
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      }}
    >
      <span className="opacity-90">{tile.icon}</span>
      <div>
        <p className="text-sm font-semibold leading-tight">{tile.label}</p>
        <p className="text-[11px] opacity-75">{tile.sub}</p>
      </div>
    </div>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

const services = [
  {
    number: '01',
    bg: 'bg-indigo-900',
    title: 'Process cycles that drive yield & consistency.',
    description:
      "We map your product's moisture curve, tune primary and secondary drying, and build a repeatable SOP your operators can run without guesswork. Every engagement ships a validated recipe, a cycle log template, and a troubleshooting guide. The goal is simple: scrap down, yield up.",
    quote: 'They rebuilt our freeze-dry cycle from scratch and cut batch time by almost a third without touching product quality.',
    author: 'Maya Chen',
    role: 'Founder @Thistle & Bloom',
    tiles: ['Cycle A', 'Cycle B', 'QC Log'],
  },
  {
    number: '02',
    bg: 'bg-slate-800',
    title: 'Controls & automation teams actually trust.',
    description:
      "We start from your plant's failure modes, map the critical alarms, and build monitoring that operators check instead of ignore. Every sprint ships clear HMI screens, a data-logging layer, and a maintenance-ready wiring set. Expect downtime down, traceability up.",
    quote: 'The new HMI is the first thing our night shift actually likes using.',
    author: 'Owen Reyes',
    role: 'Co-Founder @Alpine Provisions',
    tiles: ['HMI', 'Alarms', 'Logs'],
  },
  {
    number: '03',
    bg: 'bg-red-600',
    title: 'Facility layouts for growing production lines.',
    description:
      'We align throughput targets, room adjacencies, and utility runs before a single wall goes up. You get a clear floor plan, an equipment spec sheet, and a phased build-out you can fund in stages. Your team gets a layout it can scale without re-engineering the whole plant.',
    quote: 'We expanded from one line to three in the same footprint. That plan is why.',
    author: 'Priya Nandi',
    role: 'Ops Lead @Harvest Collective',
    tiles: ['Layout', 'Utilities', 'Phasing'],
  },
  {
    number: '04',
    bg: 'bg-amber-900',
    title: 'Documentation that survives an audit.',
    description:
      'We turn tribal knowledge into SOPs, batch records, and validation packets your QA team can actually defend. Your documentation can be handed to a new operator, read solo, and holds up when an auditor asks why.',
    quote: 'First co-packer audit we passed on the first try. The paperwork did the work for us.',
    author: 'Marcus Webb',
    role: 'Founder @Coastal Cure Co.',
    tiles: ['SOPs', 'Batch Rec.', 'Validation'],
  },
];

const testimonials = [
  {
    quote:
      "They rebuilt our freeze-dry cycle from scratch and cut batch time by almost a third without touching product quality.",
    author: 'Maya Chen',
    role: 'Founder @Thistle & Bloom',
    dark: false,
    leftPercent: 0,
    topPx: 8,
    rotateDeg: -9,
  },
  {
    quote:
      "We'd seen other agencies lock everything down after two rounds of feedback, then charge more. With this team the flexibility was real. That's why we chose them.",
    author: 'Owen Reyes',
    role: 'Co-Founder @Alpine Provisions',
    dark: true,
    leftPercent: 14,
    topPx: 24,
    rotateDeg: -4,
  },
  {
    quote:
      'We knew their work before reaching out — the craft was obvious. The final build delivered exactly that, and the team stayed fast and informal the whole way.',
    author: 'Priya Nandi',
    role: 'Ops Lead @Harvest Collective',
    dark: false,
    leftPercent: 30,
    topPx: 0,
    rotateDeg: 0,
  },
  {
    quote:
      "I've worked with this team on three separate lines now — a pilot cell, a full retrofit, and a documentation pass. I love how flexible, fast, and professional they are.",
    author: 'Marcus Webb',
    role: 'Founder @Coastal Cure Co.',
    dark: true,
    leftPercent: 46,
    topPx: 20,
    rotateDeg: 4,
  },
  {
    quote:
      "We had a legacy line that hadn't changed since 2013. Handing it to an outside team was a leap of faith. They held their ground on the calls that mattered, and looking back, they were right.",
    author: 'Elena Sato',
    role: 'CEO @Root & Ready Foods',
    dark: false,
    leftPercent: 60,
    topPx: 4,
    rotateDeg: 9,
  },
];

const partnerLogos = [
  'Air-Tech Spincotech Logo.png',
  'Cryodry Logo Spincotech.png',
  'Kinematica Logo Spincotech.png',
  'Liebherr Logo Spincotech.png',
  'LightHouse Logo Spincotech.png',
  'SP Logo Spincotech.png',
  'Spectral Engines Spincotech.png',
  'Technobis Logo Spincotech.png',
  'Tempris Logo Spincotech.png',
  'biopharma Group Logo Spincotech.png',
  'psl Logo Spincotech.png',
  'pti Logo Spincotech.png',
  'tec5 Logo Spincotech.png',
];

export default function ProcessTechnologyPage() {
  return (
    <>
      <ProcessTechnologyNavbar />
      <div className="pt-[74px]">
      {/* Hero — heading + partner logo slider */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-6">
        <div className="max-w-full mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-gray-900! m-0">
            Process Technology
          </h1>
        </div>

        <div className="mt-12 sm:mt-16 overflow-hidden">
          <div className="flex items-center gap-16 w-max animate-marquee">
            {[...partnerLogos, ...partnerLogos].map((file, i) => (
              <img
                key={`${file}-${i}`}
                src={`/Process-Technology/${encodeURIComponent(file)}`}
                alt={file.replace(/\.png$/i, '')}
                className="h-10 sm:h-12 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
              />
            ))}
          </div>
        </div>
      </section>

      {/* See more work — circle section */}
      <section id="work" className="relative overflow-hidden py-24 sm:py-32 px-6 text-white bg-[#0b0b0c] scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="group relative min-h-[420px] sm:min-h-[520px] flex items-center justify-center">
            <div className="absolute inset-0 origin-center scale-[0.8] transition-transform duration-500 ease-out group-hover:scale-[0.65]">
              <RotatingCircle className="absolute inset-0">
                {workTiles.map((tile, i) => (
                  <WorkTileCard key={tile.label} tile={tile} index={i} />
                ))}
              </RotatingCircle>
            </div>

            <div className="relative z-10 text-center px-4">
              <p className="uppercase tracking-[0.3em] text-xs text-white/40 mb-4">Our Work</p>
              <Link
                href="/shop"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-gray-900 text-sm font-semibold px-6 py-3 no-underline transition-transform hover:-translate-y-0.5"
              >
                Explore the archive
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* mobile fallback grid, since the scattered tiles are desktop-only */}
          <div className="lg:hidden grid grid-cols-3 gap-3 mt-10">
            {workTiles.map((tile) => (
              <div
                key={tile.label}
                className={`flex flex-col justify-between rounded-xl p-3 h-24 bg-gradient-to-br ${tile.gradient} text-white cursor-pointer`}
              >
                <span className="opacity-90 scale-75 origin-top-left">{tile.icon}</span>
                <p className="text-[10px] font-semibold leading-tight">{tile.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Below section — what we ship */}
      <section id="services" className="bg-[#f5f1e8] pt-8 sm:pt-28 px-4 scroll-mt-24">
        <div className="max-w-6xl mx-auto text-left">
          <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-3">What we ship</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900! m-0 mb-14">Our ways to move fast</h2>

          <StackedServiceCards services={services} />
        </div>
      </section>

      {/* Trusted by +40 founders */}
      <section id="trusted" className="bg-[#f5f1e8] pb-24 sm:pb-32 px-6 overflow-hidden scroll-mt-2">
        <div className="max-w-6xl mx-auto">
          <div className="mb-24">
            <h2 className="text-5xl sm:text-6xl font-bold leading-[0.95] m-0">
              <span className="text-gray-900!">Trusted by</span>
              <br />
              <span className="text-gray-400!">+40 founders</span>
            </h2>
          </div>

          {/* desktop fan */}
          <TrustedByFan testimonials={testimonials} />

          {/* mobile scroll list */}
          <div className="sm:hidden flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory">
            {testimonials.map((t) => (
              <div key={t.author} className="trusted-card relative snap-start shrink-0 w-[80vw]">
                <div
                  className={`trusted-card-box absolute inset-0 rounded-2xl shadow-lifted ${
                    t.dark ? 'bg-neutral-800' : 'bg-white'
                  }`}
                />
                <div className={`relative p-6 ${t.dark ? 'text-white' : 'text-gray-900'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <Stars />
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${t.dark ? 'text-white/60' : 'text-gray-500'}`}>
                      Contact Sales
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-6 ${t.dark ? 'text-white/85' : 'text-gray-700'}`}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar name={t.author} className={`w-9 h-9 text-xs ${t.dark ? 'bg-white/10! text-white!' : ''}`} />
                    <div className="text-xs">
                      <div className="font-semibold">{t.author}</div>
                      <div className={t.dark ? 'text-white/60' : 'text-gray-500'}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
