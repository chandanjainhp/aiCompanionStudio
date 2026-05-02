import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef(({
  className,
  type,
  ...props
}, ref) => {
  return <input type={type} className={cn("flex h-[44px] w-full rounded-none border-2 border-primary bg-background px-3 py-2 text-base font-sans ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";
export { Input };