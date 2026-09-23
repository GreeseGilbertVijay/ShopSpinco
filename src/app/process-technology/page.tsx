import type { Metadata } from 'next';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import StackedServiceCards from '@/components/StackedServiceCards';
import TrustedByFan from '@/components/TrustedByFan';

export const metadata: Metadata = {
  title: 'Process & Technology · ShopSpinco',
  description: 'A look at the freeze-dry process technology and engineering work behind ShopSpinco.',
  robots: { index: false, follow: false },
};

function SnowflakeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M12 2l-2 2M12 2l2 2M12 22l-2-2M12 22l2-2" />
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
    bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-white',
    badge: 'bg-indigo-100 text-indigo-700',
    glow: 'bg-indigo-200',
    dot: 'bg-indigo-500',
    title: 'Freeze-Drying',
    description:
      "ATS Global is the Independent Solution Provider for Smart Digital Transformation. We are a passionate automation, quality and IT enterprise delivering tangible business value to our customers world-wide. Established in 1986, ATS Global continues its journey on the path to digital transformation.",
    highlights: [
      'GMP Freeze Dryer for Injectables Manufacturing',
      'GMP Freeze Dryer for Biopharma Drug Intermediates, Peptides and Oligos',
      'Standardized Freeze Dryer for Diagnostics',
    ],
    logos: [
      { file: 'SP Logo Spincotech.png' },
      { file: 'biopharma Group Logo Spincotech.png' },
      { file: 'Tempris Logo Spincotech.png' },
    ],
  },
  {
    number: '02',
    bg: 'bg-gradient-to-br from-cyan-50 via-slate-50 to-white',
    badge: 'bg-slate-200 text-slate-700',
    glow: 'bg-cyan-200',
    dot: 'bg-cyan-600',
    title: 'Sterilization',
    description:
      "Getinge ISOTEST is an isolator designed for sterility testing of sterile drugs, components, and devices. Continuous workflow, easy access, and fast bio-decontamination help increase productivity.",
    highlights: [
      'Component & Decontamination Sterilizers',
      'Steam-Air Mixture Sterilizer for injectables',
      'cGMP Custom Designed Washers',
      'Sterility Test Isolators',
      'Sterile Transfer Systems',
    ],
    logos: [{ file: 'Getinge Logo Spincotech.png' }],
  },
  {
    number: '03',
    bg: 'bg-gradient-to-br from-rose-50 via-red-50 to-white',
    badge: 'bg-rose-100 text-rose-700',
    glow: 'bg-rose-200',
    dot: 'bg-rose-500',
    title: 'Homogenization',
    description:
      'Ever since our company’s founder, Professor Willems, revolutionized the industry with his rotor / stator invention, Kinematica has continued perfecting the technique by customizing and engineering its solutions to fit the most demanding applications.',
    highlights: [
      'Inline Homogenizer for Microspheres, Wet-milling and Propofol',
      'Microspheres Processing in Complex Injectables',
      'Advanced Crystallization Studies in API and Injectables',
    ],
    logos: [
      { file: 'Kinematica Logo Spincotech.png' },
      { file: 'psl Logo Spincotech.png' },
      { file: 'Technobis Logo Spincotech.png' },
    ],
  },
  {
    number: '04',
    bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-white',
    badge: 'bg-amber-100 text-amber-800',
    glow: 'bg-amber-200',
    dot: 'bg-amber-500',
    title: 'Packaging Inspection pti-ccit',
    description:
      'PTI - Packaging Technologies & Inspection is headquartered in Hawthorne, New York, a Westchester county community close to New York City. PTI is a collective of scientists, engineers and packaging practitioners focused on improving the entire package quality experience throughout the packaging lifecycle.',
    highlights: [
      'At-line and Automated O2 & Pressure Headspace Inspection for Parenteral',
      'Inline CO2 Measurement for Media Fill Inspection and CCIT',
      'Automated and Online CCI Leak Testing for Parenteral',
    ],
    logos: [{ file: 'pti Logo Spincotech.png' }, { file: 'LightHouse Logo Spincotech.png' }],
  },
  {
    number: '05',
    bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-white',
    badge: 'bg-orange-100 text-orange-700',
    glow: 'bg-orange-200',
    dot: 'bg-orange-500',
    title: 'Process Spectroscopy & PAT',
    description:
      'The Liebherr Group is a family-run technology company with a broadly diversified product programme, which includes a total of 13 product segments. tec5 thereby covers the entire technology chain for the development and production of the systems, setting standards in the flexible and rapid adaptation of the devices to meet individual process requirements and customer demands.We specialize in MEMS-based near-infrared spectral measurements and offer digital solutions, including app and cloud platforms, for seamless data processing and analysis.',
    highlights: [
      'Process Spectroscopy for Pharmaceutical manufacturing.',
      'Online Moisture and water content for API manufacturing.',
    ],
    logos: [
      { file: 'Liebherr Logo Spincotech.png' },
      { file: 'tec5 Logo Spincotech.png' },
      { file: 'Spectral Engines Spincotech.png' },
    ],
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
              href="https://spincotech.com/life-sciences/feedback-form/"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white text-sm font-semibold px-6 py-3 no-underline transition-all hover:bg-black hover:-translate-y-0.5 hover:shadow-elevated"
            >
              Feedback Form
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a
              href="https://spincotech.com/contact-us/"
              className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 text-sm font-semibold px-6 py-3 no-underline border border-gray-200 transition-all hover:border-accent hover:-translate-y-0.5"
            >
              Contact Us
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

      {/* Categories Section */}
      <section id="services" className="pt-4 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto text-left">
          <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-3">Our Solutions</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900! m-0">Process Technology</h2>
          <StackedServiceCards services={services} />
        </div>
      </section>

      {/* Trusted by +40 founders */}
      <section id="trusted" className=" pb-24 sm:pb-32 px-6 overflow-hidden scroll-mt-2">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-24">
            <h2 className="text-5xl sm:text-6xl font-bold leading-[0.95] m-0">
              <span className="text-gray-900!">Trusted by</span>
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
