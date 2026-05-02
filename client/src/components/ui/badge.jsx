import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-pill px-[12px] py-[2px] font-mono uppercase text-[11px] font-bold tracking-[1px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-border text-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border-2 border-primary text-primary"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
function Badge({
  className,
  variant,
  ...props
}) {
  return <div className={cn(badgeVariants({
    variant
  }), className)} {...props} />;
}
export { Badge, badgeVariants };