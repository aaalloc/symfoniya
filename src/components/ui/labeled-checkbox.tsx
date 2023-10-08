import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import React from "react"

import { cn } from "@/lib/utils"

import { Checkbox } from "./checkbox"

const LabeledCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, children, ...props }) => (
  <div className={cn("flex items-center space-x-2 w-full", className)}>
    <Checkbox {...props} />
    <label
      htmlFor={props.id}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
    >
      {children}
    </label>
  </div>
))
LabeledCheckbox.displayName = "LabeledCheckbox"

export { LabeledCheckbox }
