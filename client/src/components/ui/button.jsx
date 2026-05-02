import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-base font-bold font-sans tracking-[0.3px] ring-offset-background transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
      destructive: "border-2 border-destructive bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground",
      outline: "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
      secondary: "border-2 border-primary bg-primary text-primary-foreground hover:bg-background hover:text-primary",
      ghost: "hover:bg-primary hover:text-primary-foreground",
      link: "text-primary hover:text-accent underline-offset-4 hover:underline"
    },
    size: {
      default: "h-[44px] px-[24px] py-[12px]",
      sm: "h-9 px-3",
      lg: "h-12 px-8",
      icon: "h-[40px] w-[40px] rounded-[50%] border"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({
    variant,
    size,
    className
  }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };