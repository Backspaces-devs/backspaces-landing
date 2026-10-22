import Link from "next/link";

import { LiquidButton } from "@/components/ui/liquid-button";
import { homeContent } from "@/content/home";

import { ParticleGlobe } from "./particle-globe";
import "./hero.css";

export function HomeHero() {
  const { hero } = homeContent;

  return (
    <section className="bs-home-hero" aria-labelledby="home-hero-heading">
      <div className="bs-home-hero-grid">
        <div className="bs-home-hero-copy">
          <h1 id="home-hero-heading" className="bs-home-hero-heading">
            <span>{hero.heading.primary}</span>{" "}
            <span className="bs-home-hero-heading-muted">
              {hero.heading.muted}
            </span>
          </h1>

          <p className="bs-home-hero-description">{hero.description}</p>

          <div className="bs-home-hero-actions">
            <LiquidButton asChild size="lg" className="bs-home-hero-cta">
              <Link
                href={hero.cta.href}
                target={hero.cta.external ? "_blank" : undefined}
                rel={hero.cta.external ? "noopener noreferrer" : undefined}
              >
                {hero.cta.label}
                {hero.cta.external && (
                  <span className="bs-home-hero-sr-only">
                    {" "}
                    (opens in a new tab)
                  </span>
                )}
              </Link>
            </LiquidButton>
          </div>
        </div>

        <div className="bs-home-hero-graphic" aria-hidden="true">
          <ParticleGlobe
            rotationSpeed={hero.globe.rotationSpeed}
            mapSamples={hero.globe.mapSamples}
          />
        </div>
      </div>
    </section>
  );
}
