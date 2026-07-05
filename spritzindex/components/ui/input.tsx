import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
      "h-14 w-full min-w-0 rounded-full border border-gray-300 bg-white px-6 py-2 text-base text-black outline-none placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-lg",        
      className
      )}
      {...props}
    />
  )
}

export { Input }
