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
import { DialogClose } from "@radix-ui/react-dialog";
import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';
import { useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"



export function AddMusic() {
    const [buttonDesc, setButtonDesc] = useState<string>(
        "Waiting to be clicked. This calls 'on_button_clicked' from Rust.",
    )
    const [path, setPath] = useState<string | string[] | null>('None');
    const choose_path = async () => {
        const import_dialog = await import('@tauri-apps/api/dialog');
        const import_path = await import('@tauri-apps/api/path');
        const path = await import_dialog.open({
            directory: true,
            multiple: true,
            defaultPath: await import_path.audioDir(),
        });
        setPath(path);
    }

    const handle_submit = () => {
        invoke<string>("import_from_folders", { folders: path })
            .then((value) => {
                setButtonDesc(value)
            })
            .catch(() => {
                setButtonDesc("Failed to invoke Rust command 'on_button_clicked'")
            })
    }
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
                        <Input onClick={choose_path} id="path" value={path == null ? "Something happened ..." : path} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button onClick={handle_submit} disabled={path != "None" && (typeof path != null) ? false : true} type="submit">Import musics</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}