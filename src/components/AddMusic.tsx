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
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogClose } from "@radix-ui/react-dialog";
import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';
import { useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { type } from "os"
import { ScrollArea } from "@radix-ui/react-scroll-area"



export function AddMusic() {
    const [buttonDesc, setButtonDesc] = useState<string>(
        "Waiting to be clicked. This calls 'on_button_clicked' from Rust.",
    )
    const [path, setPath] = useState<string | string[]>('None');
    const choose_path = async () => {
        const import_dialog = await import('@tauri-apps/api/dialog');
        const import_path = await import('@tauri-apps/api/path');
        const path = await import_dialog.open({
            directory: true,
            multiple: true,
            defaultPath: await import_path.audioDir(),
        });
        if (typeof path == null) {
            setPath("None");
        }
        else {
            setPath(path);
        }
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
                </DialogHeader>
                {/* value={path == null ? "Something happened ..." : path} */}
                {path == 'None' ? <div onClick={choose_path} className="cursor-pointer grid h-[200px] items-center justify-center rounded-md border border-dashed text-sm">
                    <div className="items-center">
                        <p className="text-sm text-muted-foreground">Select a or multiple folder path </p>
                    </div>
                </div> :
                    <div className="h-[200px] items-center justify-center rounded-md border text">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Path</TableHead>
                                </TableRow>
                            </TableHeader>
                            {/* <TableCaption>Path selected</TableCaption> */}
                            <ScrollArea className="h-36">
                                <TableBody>
                                    {typeof path == "string" ? <TableRow>
                                        <TableCell>{path}</TableCell>
                                    </TableRow> : path.map((value) => {
                                        return <TableRow>
                                            <TableCell className="w-auto">{value}</TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </ScrollArea>
                        </Table>
                    </div>
                }
                <DialogFooter>
                    <DialogClose>
                        <Button onClick={handle_submit} disabled={path != "None" && (typeof path != null) ? false : true} type="submit">Import musics</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    )
}