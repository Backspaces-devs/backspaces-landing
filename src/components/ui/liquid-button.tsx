"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const liquidButtonVariants = cva(
  "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border text-sm font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-foreground/20 bg-foreground/10 text-foreground shadow-lg shadow-black/10 hover:border-foreground/30 hover:bg-foreground/20",
        outline:
          "border-foreground/20 bg-transparent text-foreground shadow-sm hover:border-foreground/30 hover:bg-foreground/5",
        secondary:
          "border-primary/30 bg-primary/10 text-foreground shadow-lg shadow-primary/10 hover:border-primary/50 hover:bg-primary/20",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive shadow-sm hover:bg-destructive/20 focus-visible:ring-destructive",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 gap-1.5 px-4 text-xs",
        lg: "h-11 px-6",
        xl: "h-12 px-8",
        xxl: "h-14 px-10 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      disabled,
      type,
      tabIndex,
      onClick,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const filterId = `liquid-glass-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const Comp = asChild ? Slot : "button";

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <>
        <GlassFilter id={filterId} />

        <Comp
          {...props}
          ref={ref}
          data-slot="liquid-button"
          className={cn(liquidButtonVariants({ variant, size }), className)}
          type={asChild ? undefined : (type ?? "button")}
          disabled={asChild ? undefined : disabled}
          aria-disabled={disabled ? true : props["aria-disabled"]}
          tabIndex={asChild && disabled ? -1 : tabIndex}
          onClick={handleClick}
        >
          {/* This blur remains as a fallback when SVG refraction is unsupported. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-30 rounded-[inherit] backdrop-blur-md backdrop-saturate-150"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 rounded-[inherit]"
            style={{
              backdropFilter: `url("#${filterId}")`,
              WebkitBackdropFilter: `url("#${filterId}")`,
            }}
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-linear-to-b from-white/25 via-white/5 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_1px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.1)]"
          />

          {/* Slottable lets Slot apply the button props to Link itself. */}
          <Slottable>{children}</Slottable>
        </Comp>
      </>
    );
  },
);

LiquidButton.displayName = "LiquidButton";

function GlassFilter({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <defs>
        <filter
          id={id}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.02"
            numOctaves="1"
            seed="1"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="smoothNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothNoise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="B"
            result="refracted"
          />
          <feGaussianBlur in="refracted" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  );
}

export { LiquidButton, liquidButtonVariants };
