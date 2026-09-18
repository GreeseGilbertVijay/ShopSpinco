import type { Metadata } from 'next';
import Link from 'next/link';
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
function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  );
}
function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M3 11h18M10 7V4h4v3" />
      <circle cx="7" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function MicroscopeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 20h12M9 20a5 5 0 0 0 8.5-5" />
      <path d="M11 3h3v7h-3zM12.5 10v3" />
      <path d="M10 13h5" />
    </svg>
  );
}

type Capability = {
  label: string;
  icon: React.ReactNode;
};

const capabilities: Capability[] = [
  { label: 'Precision Thermal Control', icon: <ThermometerIcon /> },
  { label: 'Automation & Controls', icon: <SlidersIcon /> },
  { label: 'Cold Chain Systems', icon: <SnowflakeIcon /> },
  { label: 'Quality & Lab Testing', icon: <MicroscopeIcon /> },
];

const workTiles: WorkTile[] = [
  { label: 'Lab QC', sub: 'Quality', gradient: 'from-sky-500 to-sky-700', icon: <MicroscopeIcon /> },
  { label: 'Vacuum Chamber', sub: 'Equipment', gradient: 'from-indigo-500 to-indigo-700', icon: <SnowflakeIcon /> },
  { label: 'IQF Tunnel', sub: 'Process Line', gradient: 'from-accent to-accent-hover', icon: <ThermometerIcon /> },
  { label: 'Blast Freezer', sub: 'Cold Chain', gradient: 'from-emerald-500 to-emerald-700', icon: <GaugeIcon /> },
  { label: 'Control Panel', sub: 'Automation', gradient: 'from-fuchsia-500 to-fuchsia-700', icon: <SlidersIcon /> },
  { label: 'Packaging Cell', sub: 'Line Design', gradient: 'from-amber-500 to-amber-700', icon: <PackageIcon /> },


  
];

const CARD_SIZE = 200;
const CARD_GAP = 72;
// radius that keeps adjacent card edges CARD_GAP apart along the ring
const CIRCLE_RADIUS = Math.round((CARD_SIZE + CARD_GAP) / (2 * Math.sin(Math.PI / workTiles.length)));
// a square hugging the tile ring (worst-case rotated-card corner reach) plus a
// small buffer, used as the hover/zoom trigger zone so only getting close to
// the tiles themselves (not the whole empty section) shrinks the circle
const TILE_HOVER_PADDING = 10;
const HOVER_ZONE_SIZE = Math.round(2 * (CIRCLE_RADIUS + CARD_SIZE / Math.SQRT2) + TILE_HOVER_PADDING * 2);

function getCirclePosition(index: number, total: number) {
  const angle = (360 / total) * index - 120;
  const radians = (angle * Math.PI) / 180;
  return { angle, x: Math.round(Math.cos(radians) * CIRCLE_RADIUS), y: Math.round(Math.sin(radians) * CIRCLE_RADIUS) };
}

function WorkTileCard({ tile, index }: { tile: WorkTile; index: number }) {
  const { x, y, angle } = getCirclePosition(index, workTiles.length);
  // tilt each card so its bottom edge (where the label sits) faces the shared
  // center, as if gravity were pulling it toward the "Our Work" hub
  const rotation = Math.round(angle + 90);
  const normalized = ((rotation % 360) + 360) % 360;
  // on the lower half of the ring that tilt leaves labels upside-down, so
  // flip just the content in place (not the whole card) to keep it readable
  // while staying anchored to the same bottom edge as every other card
  const flipContent = normalized > 90 && normalized < 270;

  return (
    <div
      className={`hidden lg:flex absolute top-1/2 left-1/2 flex-col items-center justify-end text-center gap-2 rounded-2xl p-4 bg-gradient-to-br ${tile.gradient} text-white shadow-lifted cursor-pointer`}
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      }}
    >
      <div
        className="flex flex-col items-center gap-2"
        style={flipContent ? { transform: 'rotate(180deg)' } : undefined}
      >
        <span className="opacity-90">{tile.icon}</span>
        <div>
          <p className="text-sm font-semibold leading-tight">{tile.label}</p>
          <p className="text-[11px] opacity-75">{tile.sub}</p>
        </div>
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
    title: 'Freeze-Drying',
    description:
      "ATS Global is the Independent Solution Provider for Smart Digital Transformation. We are a passionate automation, quality and IT enterprise delivering tangible business value to our customers world-wide. Established in 1986, ATS Global continues its journey on the path to digital transformation.",
    tiles: ['Cycle A', 'Cycle B', 'QC Log'],
  },
  {
    number: '02',
    bg: 'bg-slate-800',
    title: 'Sterilization',
    description:
      "Getinge ISOTEST is an isolator designed for sterility testing of sterile drugs, components, and devices. Continuous workflow, easy access, and fast bio-decontamination help increase productivity.",
    tiles: ['HMI', 'Alarms', 'Logs'],
  },
  {
    number: '03',
    bg: 'bg-red-600',
    title: 'Homogenization',
    description:
      'Ever since our company’s founder, Professor Willems, revolutionized the industry with his rotor / stator invention, Kinematica has continued perfecting the technique by customizing and engineering its solutions to fit the most demanding applications.',
    tiles: ['Layout', 'Utilities', 'Phasing'],
  },
  {
    number: '04',
    bg: 'bg-amber-900',
    title: 'Packaging Inspection pti-ccit',
    description:
      'PTI - Packaging Technologies & Inspection is headquartered in Hawthorne, New York, a Westchester county community close to New York City. PTI is a collective of scientists, engineers and packaging practitioners focused on improving the entire package quality experience throughout the packaging lifecycle.',
    tiles: ['SOPs', 'Batch Rec.', 'Validation'],
  },
  {
    number: '05',
    bg: 'bg-orange-500',
    title: 'Process Spectroscopy & PAT',
    description:
      'The Liebherr Group is a family-run technology company with a broadly diversified product programme, which includes a total of 13 product segments. tec5 thereby covers the entire technology chain for the development and production of the systems, setting standards in the flexible and rapid adaptation of the devices to meet individual process requirements and customer demands.We specialize in MEMS-based near-infrared spectral measurements and offer digital solutions, including app and cloud platforms, for seamless data processing and analysis.',
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
    leftPercent: 18,
    topPx: 24,
    rotateDeg: -4,
  },
  {
    quote:
      'We knew their work before reaching out — the craft was obvious. The final build delivered exactly that, and the team stayed fast and informal the whole way.',
    author: 'Priya Nandi',
    role: 'Ops Lead @Harvest Collective',
    dark: false,
    leftPercent: 36,
    topPx: 0,
    rotateDeg: 0,
  },
  {
    quote:
      "I've worked with this team on three separate lines now — a pilot cell, a full retrofit, and a documentation pass. I love how flexible, fast, and professional they are.",
    author: 'Marcus Webb',
    role: 'Founder @Coastal Cure Co.',
    dark: true,
    leftPercent: 54,
    topPx: 20,
    rotateDeg: 4,
  },
  {
    quote:
      "We had a legacy line that hadn't changed since 2013. Handing it to an outside team was a leap of faith. They held their ground on the calls that mattered, and looking back, they were right.",
    author: 'Elena Sato',
    role: 'CEO @Root & Ready Foods',
    dark: false,
    leftPercent: 72,
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
      {/* Hero — heading, pitch, CTAs, capability strip, partner logo slider */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-accent-hover mb-5">
            Engineering · Automation · Cold Chain
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-gray-900! m-0">
            Process Technology
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
            From vacuum chamber design to line automation, our engineering team builds the freeze-drying,
            sterilization, and packaging systems that keep your product moving — reliably, and at scale.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white text-sm font-semibold px-6 py-3 no-underline transition-all hover:bg-black hover:-translate-y-0.5 hover:shadow-elevated"
            >
              See our work
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a
              href="https://spincotech.com/contact-us/"
              className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 text-sm font-semibold px-6 py-3 no-underline border border-gray-200 transition-all hover:border-accent hover:-translate-y-0.5"
            >
              Talk to an engineer
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="relative mt-16 sm:mt-20 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="flex flex-col items-center gap-2 text-center rounded-2xl px-3 py-5 bg-gray-50 border border-gray-100 transition-colors hover:border-accent/40"
            >
              <span className="text-accent-hover">{cap.icon}</span>
              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-tight m-0">{cap.label}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-16 sm:mt-20 overflow-hidden">
          <p className="text-center uppercase tracking-[0.3em] text-[11px] text-gray-400 mb-6">
            Technology partners powering our lines
          </p>
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

      {/* See more of our work — circle section */}
      <section
        id="work"
        className="relative overflow-hidden py-24 sm:py-32 px-6 text-white scroll-mt-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative max-w-2xl mx-auto text-center mb-16 sm:mb-20">
          <p className="uppercase tracking-[0.3em] text-xs text-white/40 mb-4">Our Work</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white m-0">
            Equipment we design, install, and support
          </h2>
          <p className="mt-4 text-white/60 text-base sm:text-lg">
            A closer look at the lines and tooling behind a typical Spinco engagement — from first vacuum test to
            full production.
          </p>
        </div>

        <div className="relative max-w-full">
          <div className="relative min-h-[420px] sm:min-h-[520px] flex items-center justify-center">
            <div
              className="absolute origin-center scale-[0.8] transition-transform duration-500 ease-out hover:scale-[0.65]"
              style={{
                width: HOVER_ZONE_SIZE,
                height: HOVER_ZONE_SIZE,
                left: `calc(50% - ${HOVER_ZONE_SIZE / 2}px)`,
                top: `calc(50% - ${HOVER_ZONE_SIZE / 2}px)`,
              }}
            >
              <RotatingCircle className="absolute inset-0">
                {workTiles.map((tile, i) => (
                  <WorkTileCard key={tile.label} tile={tile} index={i} />
                ))}
              </RotatingCircle>
            </div>

            <div className="relative z-10 text-center px-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 text-sm font-semibold px-6 py-3 no-underline shadow-lifted transition-transform hover:-translate-y-0.5"
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
                className={`flex flex-col justify-between rounded-xl p-3 h-24 bg-gradient-to-br ${tile.gradient} text-white shadow-lifted cursor-pointer transition-transform hover:-translate-y-0.5`}
              >
                <span className="opacity-90 scale-75 origin-top-left">{tile.icon}</span>
                <p className="text-[10px] font-semibold leading-tight">{tile.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Below section — what we ship */}
      <section id="services" className="pt-4 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto text-left">
          <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-3">What we ship</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900! m-0">Our ways to move fast</h2>
          <p className="mt-4 max-w-2xl text-gray-500 text-base sm:text-lg">
            Each engagement pairs proven equipment partners with our own controls and validation work — scroll
            through a few of the disciplines we cover.
          </p>
          <StackedServiceCards services={services} />
        </div>
      </section>

      {/* Trusted by +40 founders */}
      <section id="trusted" className=" pb-24 sm:pb-32 px-6 overflow-hidden scroll-mt-2">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-24">
            <h2 className="text-5xl sm:text-6xl font-bold leading-[0.95] m-0">
              <span className="text-gray-900!">Trusted by</span>
              <br />
              <span className="text-gray-400!">+40 founders</span>
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-gray-500 text-base sm:text-lg">
              Food, biotech, and pharma teams bring us in when a line has to work the first time.
            </p>
          </div>

          {/* desktop fan — fixed width matches the scattered cards' own
              footprint so the cluster centers as a block, since the cards
              are positioned with left-percent offsets, not centered text */}
          <div className="mx-auto" style={{ width: 1000 }}>
            <TrustedByFan testimonials={testimonials} />
          </div>

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

      {/* Closing CTA */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900! m-0">Have a line that needs engineering?</h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Tell us about your process and we will follow up with next steps — equipment selection, automation
            scope, and a realistic timeline.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="https://spincotech.com/contact-us/"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white text-sm font-semibold px-6 py-3 no-underline transition-all hover:bg-black hover:-translate-y-0.5 hover:shadow-elevated"
            >
              Talk to an engineer
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 text-sm font-semibold px-6 py-3 no-underline border border-gray-200 transition-all hover:border-accent hover:-translate-y-0.5"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
