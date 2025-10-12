import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "shadow-s bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "shadow-s bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "shadow-s bg-green-500/75 text-white shadow-xs hover:bg-green-600/80 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40",
        amber:
          "bg-amber-500 text-white shadow-xs hover:bg-amber-600 focus-visible:ring-amber-500/20 dark:focus-visible:ring-amber-500/40",
        blue: "shadow-s bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-600/20 dark:focus-visible:ring-blue-600/40",
        purple:
          "shadow-s bg-purple-500 text-white shadow-xs hover:bg-purple-600 focus-visible:ring-purple-500/20 dark:focus-visible:ring-purple-500/40",
        pink: "bg-pink-500 text-white shadow-xs hover:bg-pink-600 focus-visible:ring-pink-500/20 dark:focus-visible:ring-pink-500/40",
        teal: "bg-teal-500 text-white shadow-xs hover:bg-teal-600 focus-visible:ring-teal-500/20 dark:focus-visible:ring-teal-500/40",
        gray: "bg-gray-500 text-white shadow-xs hover:bg-gray-600 focus-visible:ring-gray-500/20 dark:focus-visible:ring-gray-500/40",
      },
      size: {
        default: "rounded-lg h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        ssm: "h-7 rounded-lg gap-1.5 px-2 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
        xxs: "h-0 px-0 py-0"
      },
    },
    defaultVariants: {
      variant: "blue",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
