import React from "react"

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function GlowingGradientBorderButton({
  children,
}: {
  children: React.ReactNode
}) {
  const gradient = "bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F]"
  const gradient_blurred =
    "bg-gradient-to-r to-[#00C5DF]/40 via-[#FFC700]/40 from-[#F2371F]/40"
  return (
    <button className="flex justify-center text-center items-center w-full">
      <div className="relative group">
        <div
          className={cn(
            "absolute -inset-0.5 rounded-2xl blur-lg group-hover:blur-lg  transition duration-500 group-hover:duration-200 will-change-filter overflow-hidden",
            gradient_blurred,
          )}
        />
        <div className="relative group-hover:scale-105 duration-500 group-hover:duration-200">
          <div
            className={cn("block inset-0.5 rounded-xl p-[3px] transition", gradient)}
          >
            <div className="w-56 px-4 py-[10px] text-sm font-medium color-white bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
