import * as React from "react";
import { cn } from "@/lib/utils";
const Card = React.forwardRef(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("bg-background text-foreground", className)} {...props} />);
Card.displayName = "Card";
const CardHeader = React.forwardRef(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({
  className,
  ...props
}, ref) => <h3 ref={ref} className={cn("font-display text-[26px] leading-[1.08] tracking-tight", className)} {...props} />);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({
  className,
  ...props
}, ref) => <p ref={ref} className={cn("font-body text-[16px] text-foreground mt-2", className)} {...props} />);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex items-center p-6 pt-0 border-t border-border mt-4", className)} {...props} />);
CardFooter.displayName = "CardFooter";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };