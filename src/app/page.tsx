import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { HeroClock } from "@/components/landing/HeroClock";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { TriusMark } from "@/components/ui/TriusMark";

export const metadata: Metadata = {
  title: "TRIUS — Design studio & Systems",
  description: "A TRIUS constrói identidades e experiências digitais para times técnicos e ambiciosos que querem clareza, não ruído.",
};

export default function LandingPage() {
  return (
    <section className="hero-root" id="hero">
      <ScrollReveal />

      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-topbar hero-container">
        <div className="hero-logo">
          <TriusMark className="hero-logo-mark" />
        </div>

        <nav className="hero-nav" aria-label="Navegação principal">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#about">About</a>
        </nav>

        <button className="menu-btn" type="button">
          <span className="grid-icon" aria-hidden="true"><i /><i /><i /><i /></span>
          Menu
        </button>
      </div>

      <div className="hero-body hero-container">
        <div>
          <div className="eyebrow hero-eyebrow reveal-fade" style={{ "--reveal-index": 0 } as React.CSSProperties}>
            <span className="sq" aria-hidden="true" />
            Design studio — Systems
          </div>

          <h1 className="hero-title reveal-fade" style={{ "--reveal-index": 1 } as React.CSSProperties}>
            Emerging systems <span className="dim">of the future.</span>
          </h1>

          <p className="hero-desc reveal-fade" style={{ "--reveal-index": 2 } as React.CSSProperties}>
            A TRIUS constrói identidades e experiências digitais para times técnicos e ambiciosos que querem clareza, não ruído.
          </p>

          <div className="hero-ctas reveal-fade" style={{ "--reveal-index": 3 } as React.CSSProperties}>
            <ButtonLink href="#contact" variant="solid-light" cornerDots>
              Discuss a project
            </ButtonLink>
            <ButtonLink href="#work" variant="transparent" cornerDots>
              View selected work
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="hero-panel-wrap">
        <div className="hero-panel reveal-fade" style={{ "--reveal-index": 2 } as React.CSSProperties}>
          <div className="hero-panel-frame">
            <Image src="/img/imgHero.jpg" alt="Figura escultural em preto e branco, referência visual TRIUS" fill sizes="(min-width: 1024px) 36vw, 0px" style={{ objectFit: "cover" }} />
            <div className="hero-panel-overlay" aria-hidden="true" />
            <div className="hero-panel-vert" aria-hidden="true"><span>Systems</span></div>
            <div className="hero-panel-tag">
              <div>
                <p className="label">Now booking</p>
                <p className="sub">Q4 design partnerships</p>
              </div>
              <span className="arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-foot hero-container">
        <span>Scroll to explore</span>
        <HeroClock />
      </div>
    </section>
  );
}
