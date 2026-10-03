import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-blue-200 bg-blue-50 text-blue-700",
        secondary:
          "border border-purple-200 bg-purple-50 text-purple-700",
        emerald:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border border-amber-200 bg-amber-50 text-amber-700",
        outline:
          "border border-slate-200 bg-slate-50 text-slate-700",
        beginner:
          "border border-green-200 bg-green-50 text-green-700 font-semibold",
        intermediate:
          "border border-blue-200 bg-blue-50 text-blue-700 font-semibold",
        advanced:
          "border border-purple-200 bg-purple-50 text-purple-700 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
