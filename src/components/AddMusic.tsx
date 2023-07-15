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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogClose } from "@radix-ui/react-dialog";
import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';
import { useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { type } from "os"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { X, FolderPlus } from "lucide-react"



export function AddMusic() {
    const [buttonDesc, setButtonDesc] = useState<string>(
        "Waiting to be clicked. This calls 'on_button_clicked' from Rust.",
    )
    const [arr_path, setPath] = useState<string | string[]>("None")
    const removePath = (path: string) => {
        //console.log(path)
        setPath(arr_path.filter((value) => {
            return value != path
        }))
    }
    const choose_path = async () => {
        const import_dialog = await import('@tauri-apps/api/dialog');
        const import_path = await import('@tauri-apps/api/path');
        const new_paths = await import_dialog.open({
            directory: true,
            multiple: true,
            defaultPath: await import_path.audioDir(),
        });
        if (new_paths != null) {
            const path_w_dup = new_paths.filter((path) => !arr_path.includes(path));
            setPath(arr_path[0] !== 'None' && arr_path.length !== 0 ? [...arr_path, ...path_w_dup] : path_w_dup);
        }

    }

    const handle_submit = () => {
        invoke<string>("import_from_folders", { folders: arr_path })
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
                {arr_path == 'None' || arr_path.length == 0 ? <div onClick={choose_path} className="cursor-pointer grid h-[200px] items-center justify-center rounded-md border border-dashed text-sm">
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
                            {/* patch w-1 when path to big*/}
                            <ScrollArea className="h-36 w-1">
                                <TableBody>
                                    {typeof arr_path == "string" ? <TableRow>
                                        <TableCell>{arr_path}</TableCell>
                                        <TableCell className="w-1/12">
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Remove path</span>
                                                <X onClick={() => removePath(arr_path)} className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow> : arr_path.map((value) => {
                                        return <TableRow>
                                            <TableCell>{value}</TableCell>
                                            <TableCell className="w-1/12">
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Remove path</span>
                                                    <X onClick={() => removePath(value)} className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </ScrollArea>
                        </Table>
                    </div>
                }
                <DialogFooter>
                    {arr_path == 'None' || arr_path.length == 0 ? <></> :
                        <Button variant="outline">
                            <FolderPlus onClick={choose_path} />
                        </Button>
                    }
                    <DialogClose>
                        <Button onClick={handle_submit} disabled={arr_path != "None" && (typeof arr_path != null) ? false : true} type="submit">Import musics</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    )
}