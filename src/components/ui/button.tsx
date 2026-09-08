import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-bg hover:opacity-90",
        ghost: "bg-transparent text-fg hover:bg-surface-2",
        chip: "rounded-full bg-surface-2 px-4 text-sm text-muted shadow-[var(--shadow-border)] data-[on=true]:bg-primary data-[on=true]:text-bg data-[on=true]:shadow-none",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Button({
  className,
  variant,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
