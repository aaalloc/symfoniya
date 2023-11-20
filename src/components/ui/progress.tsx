import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cn } from "@/lib/utils"
const Progress = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const mask = (1 - (props.value?.[0] ?? 0) / (props.max ?? 1)) * 100

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center group/item",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="cursor-pointer  relative h-2 w-full grow overflow-hidden bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F]">
        <SliderPrimitive.Range className="absolute h-full transition-all bg-transparent" />
        <div
          className={
            "absolute top-0 right-0 bg-secondary h-full transition-all cursor-pointer w-full"
          }
          style={{ width: `${mask}%` }}
        />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb className="invisible group-hover/item:visible block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-20" />
    </SliderPrimitive.Root>
  )
})
Progress.displayName = SliderPrimitive.Root.displayName

export { Progress }
