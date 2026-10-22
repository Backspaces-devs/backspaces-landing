import Link from "next/link";
import { CompassIcon, HomeIcon } from "lucide-react";

import { LiquidButton } from "@/components/ui/liquid-button";

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.16) 2px, transparent 2px), linear-gradient(to bottom, rgb(255 255 255 / 0.16) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
        }}
      />

      <section className="relative z-10 w-full max-w-lg text-center">
        <header>
          <h1 className="text-9xl font-extrabold mask-b-from-20% mask-b-to-80%">
            <span className="sr-only">Error </span>404
          </h1>

          <p className="mx-auto text-sm -mt-6 max-w-sm text-foreground/50">
            The page you’re looking for might have been moved or doesn’t exist.
          </p>
        </header>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LiquidButton asChild size="sm">
              <Link href="/">
                <HomeIcon
                  aria-hidden="true"
                  className="size-4"
                  data-icon="inline-start"
                />
                Go Home
              </Link>
            </LiquidButton>

            <LiquidButton asChild variant="outline" size="sm">
              <Link href="/discover">
                <CompassIcon
                  aria-hidden="true"
                  className="size-4"
                  data-icon="inline-start"
                />
                Explore
              </Link>
            </LiquidButton>
          </div>
        </div>
      </section>
    </main>
  );
}
