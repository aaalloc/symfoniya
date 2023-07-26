import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import { cn } from "@/lib/utils"
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1 w-[1400px] overflow-hidden rounded-lg bg-secondary ",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F] transition-all
      shadow-xl shadow-red-500"
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
