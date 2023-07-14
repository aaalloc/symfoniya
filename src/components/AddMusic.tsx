import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AddMusic() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full space-y-4" variant="outline">Add musics</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add musics</DialogTitle>
                    <DialogDescription>
                        Select one or multiples musics according to a folder path.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Path
                        </Label>
                        <Input id="path" value="" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Import musics</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}