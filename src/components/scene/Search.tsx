import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Searchbar } from "@/components/Searchbar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DialogOverlay, DialogPortal } from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function Search() {
    return (
        <Dialog>
            <DialogPrimitive.Overlay
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            />
            <DialogTrigger asChild>
                <div className="flex items-center justify-center">
                    <Command className="rounded-lg border shadow-md">
                        <CommandInput placeholder="Type a command or search..." />
                    </Command>
                </div>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay />
                <DialogPrimitive.Content
                    className="fixed left-[50%] top-[50%] z-50 grid
         w-full max-w-lg translate-x-[-50%] translate-y-[-50%]
          gap-4 shadow-lg duration-200 
          data-[state=open]:animate-in data-[state=closed]:animate-out
           data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
             data-[state=open]:zoom-in-95 
             data-[state=closed]:slide-out-to-left-1/2
              data-[state=closed]:slide-out-to-top-[48%] 
              data-[state=open]:slide-in-from-left-1/2 
              data-[state=open]:slide-in-from-top-[48%]
               md:w-full "
                >
                    <Searchbar />

                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    )
}