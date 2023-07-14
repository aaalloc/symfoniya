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
import { MoreHorizontal, FolderPlus } from "lucide-react"



export function AddMusic() {
    const [buttonDesc, setButtonDesc] = useState<string>(
        "Waiting to be clicked. This calls 'on_button_clicked' from Rust.",
    )
    const [arr_path, setPath] = useState<string | string[]>(["test", "test2", "test3"])
    const removePath = (path: string) => {
        console.log(path)
        setPath(arr_path.filter((value) => {
            return value != path
        }))
    }
    const choose_path = async () => {
        const import_dialog = await import('@tauri-apps/api/dialog');
        const import_path = await import('@tauri-apps/api/path');
        const arr_path = await import_dialog.open({
            directory: true,
            multiple: true,
            defaultPath: await import_path.audioDir(),
        });
        if (typeof arr_path == null) {
            setPath("None");
        }
        else if (arr_path[0] == "None") {
            setPath(path);
        }
        else {
            // append
            setPath(arr_path + path);
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
                {arr_path == 'None' | arr_path.length == 0 ? <div onClick={choose_path} className="cursor-pointer grid h-[200px] items-center justify-center rounded-md border border-dashed text-sm">
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
                                    {typeof arr_path == "string" ? <TableRow>
                                        <TableCell>{arr_path}</TableCell>
                                    </TableRow> : arr_path.map((value) => {
                                        return <TableRow>
                                            <TableCell className="w-auto">{value}</TableCell>
                                            <TableCell className="w-1/12">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => removePath(value)}>Remove path</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                            <FolderPlus />
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