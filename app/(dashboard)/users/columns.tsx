"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistanceToNow } from 'date-fns'
import { deleteUser, updateUser, User } from "./actions"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => row.original.emailAddresses[0]?.emailAddress,
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => format(row.original.createdAt, 'PP'),
    },
    {
        accessorKey: "lastSignInAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Last Signed In
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => row.original.lastSignInAt ? formatDistanceToNow(row.original.lastSignInAt, { addSuffix: true }) : 'Never',
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            const [newFirstName, setNewFirstName] = useState(user.firstName)
            const [newLastName, setNewLastName] = useState(user.lastName)
            const [isUpdating, setIsUpdating] = useState(false)
            const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
            const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

            const router = useRouter()

            const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault()
                setIsUpdating(true)
                try {
                    await updateUser(user.id, newFirstName, newLastName)
                    setIsEditDialogOpen(false)
                } catch (error) {
                    console.error('Error updating user:', error)
                } finally {
                    setIsUpdating(false)
                    router.refresh()
                }
            }
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                Copy user ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteUser(user.id)}>Delete user</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                            Edit
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                                <DialogTitle>Edit user</DialogTitle>
                                <DialogDescription>
                                    Make changes to the user's information here. Click save when you're done.
                                </DialogDescription>
                            </AlertDialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="firstName" className="text-right">
                                            First name
                                        </Label>
                                        <Input
                                            id="firstName"
                                            value={newFirstName}

                                            onChange={(e) => setNewFirstName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lastName" className="text-right">
                                            Last name
                                        </Label>
                                        <Input
                                            id="lastName"
                                            value={newLastName}
                                            onChange={(e) => setNewLastName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <Button type="submit" disabled={isUpdating}>
                                        {isUpdating ? "Saving..." : "Save changes"}
                                    </Button>
                                </AlertDialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            )
        },
    },
]