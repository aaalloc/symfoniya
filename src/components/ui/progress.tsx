import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cn } from "@/lib/utils"
const Progress = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  // <SliderPrimitive.Root
  //   ref={ref}
  //   className={cn(
  //     "relative h-1 w-[1400px] overflow-hidden rounded-lg bg-secondary ",
  //     className,
  //   )}
  //   {...props}
  // >
  //   <ProgressPrimitive.Indicator
  //     className="h-full w-full flex-1 bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F] transition-all
  //     shadow-xl shadow-red-500"
  //     // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  //     style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
  //   />
  // </ProgressPrimitive.Root>

  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="cursor-pointer group/item relative h-2 w-full grow overflow-hidden bg-secondary">
      <SliderPrimitive.Range
        className="absolute h-full h-full bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F] transition-all
        shadow-xl shadow-red-500"
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="invisible group-hover/item:visible block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Progress.displayName = SliderPrimitive.Root.displayName

export { Progress }
