import { useUIStore } from "@/store/uiStore";
import { Toaster as Sonner, toast } from "sonner";

/*
 * WIRED brutalist toast — sharp corners, 2px black border,
 * inset left bar changes color per type, Playfair title, Mono type badge.
 */
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useUIStore();

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      gap={6}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: [
            // Shape & border
            "!rounded-none !shadow-none",
            "!border-2 !border-primary",
            // Colors
            "!bg-background !text-foreground",
            // Size
            "!min-w-[300px] !max-w-[380px]",
            // Default left bar (black) via inset box-shadow
            "![box-shadow:inset_4px_0_0_hsl(0_0%_0%)]",
          ].join(" "),
          content: "!px-4 !py-3 !pl-4",
          icon: "!hidden",
          title: [
            "!font-display !font-bold",
            "!text-[15px] !leading-tight !tracking-tight",
            "!text-foreground",
          ].join(" "),
          description: [
            "!font-body",
            "!text-[13px] !leading-[1.45]",
            "!text-foreground/60",
            "!mt-1",
          ].join(" "),
          actionButton: [
            "!bg-primary !text-primary-foreground",
            "!font-sans !font-bold !text-[11px] !tracking-[0.5px] !uppercase",
            "!rounded-none !border-0 !px-3 !py-1",
            "hover:!opacity-80 !transition-opacity",
          ].join(" "),
          cancelButton: [
            "!bg-transparent !text-foreground",
            "!font-sans !font-bold !text-[11px] !tracking-[0.5px] !uppercase",
            "!rounded-none !border !border-border !px-3 !py-1",
            "hover:!bg-foreground/5 !transition-colors",
          ].join(" "),
          closeButton: [
            "!border !border-border !bg-background !text-foreground",
            "!rounded-none",
            "hover:!bg-primary hover:!text-primary-foreground",
            "!transition-colors !duration-150",
          ].join(" "),
          // Type variants — override inset box-shadow for colored left bar
          success: "![box-shadow:inset_4px_0_0_hsl(200_94%_38%)]",
          error:   "![box-shadow:inset_4px_0_0_hsl(0_84%_60%)]",
          warning: "![box-shadow:inset_4px_0_0_hsl(38_92%_50%)]",
          info:    "![box-shadow:inset_4px_0_0_hsl(200_94%_38%)]",
          loading: "![box-shadow:inset_4px_0_0_hsl(0_0%_46%)]",
        },
      }}
      style={{ "--width": "380px" }}
      {...props}
    />
  );
};

export { Toaster, toast };
