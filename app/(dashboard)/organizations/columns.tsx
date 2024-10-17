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
import { format } from 'date-fns'
import { Organization, deleteOrganization, updateOrganization, updateSubscription, Subscription } from "./actions"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function OrganizationActionsCell({ row }: { row: any }) {
    const organization = row.original
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
    const [newName, setNewName] = useState(organization.name)
    const [newSlug, setNewSlug] = useState(organization.slug)
    const [newEmail, setNewEmail] = useState(organization.email)
    const [newSubscription, setNewSubscription] = useState<Subscription>(organization.subscription)
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: organization.subscriptionEnd ? new Date(organization.subscriptionEnd) : undefined,
        to: undefined,
    });



    const [isUpdating, setIsUpdating] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            await updateOrganization(organization.id, newName, newSlug, newEmail)
            setIsEditDialogOpen(false)
        } catch (error) {
            console.error('Error updating organization:', error)
        } finally {
            setIsUpdating(false)
            router.refresh()
        }
    }

    const handleSubscriptionUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const subscriptionEnd = newSubscription === 'Free' ? null : dateRange.to?.toISOString() || null
            await updateSubscription(organization.id, newSubscription, subscriptionEnd)
            setIsSubscriptionDialogOpen(false)
        } catch (error) {
            console.error('Error updating subscription:', error)
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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(organization.id)}>
                        Copy organization ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsSubscriptionDialogOpen(true)}>Update Subscription</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteOrganization(organization.id)}>Delete organization</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <DialogTitle>Edit organization</DialogTitle>
                        <DialogDescription>
                            Make changes to the organization's information here. Click save when you're done.
                        </DialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="slug" className="text-right">
                                    Slug
                                </Label>
                                <Input
                                    id="slug"
                                    value={newSlug}
                                    onChange={(e) => setNewSlug(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
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
            <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <DialogTitle>Update Subscription</DialogTitle>
                        <DialogDescription>
                            Change the organization's subscription plan and duration.
                        </DialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={handleSubscriptionUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="subscription" className="text-right">
                                    Plan
                                </Label>
                                <Select
                                    value={newSubscription}
                                    onValueChange={(value: Subscription) => setNewSubscription(value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Free">Free</SelectItem>
                                        <SelectItem value="Basic">Basic</SelectItem>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newSubscription !== 'Free' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="duration" className="text-right">
                                        Duration
                                    </Label>
                                    <DateRangePicker
                                        className="col-span-3"
                                        value={dateRange}
                                        onChange={(newValue) => {
                                            if (newValue && 'from' in newValue) {
                                                setDateRange({ from: newValue.from, to: newValue.to });
                                            } else {
                                                setDateRange({ from: undefined, to: undefined });
                                            }
                                        }}
                                    />

                                </div>
                            )}
                        </div>
                        <AlertDialogFooter>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "Updating..." : "Update Subscription"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export const columns: ColumnDef<Organization>[] = [
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
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                    src={row.getValue("imageUrl") || "/placeholder.svg"}
                    alt={`${row.getValue("name")} logo`}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
        ),
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
    },
    {
        accessorKey: "slug",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Slug
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "membersCount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Members
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "subscription",
        header: "Subscription",
        cell: ({ row }) => {
            const subscription = row.getValue("subscription") as Subscription
            return (
                <Badge variant={subscription === 'Premium' ? 'default' : subscription === 'Basic' ? 'secondary' :
                    'outline'}>
                    {subscription}
                </Badge>
            )
        },
    },
    {
        accessorKey: "subscriptionEnd",
        header: "Subscription End",
        cell: ({ row }) => {
            const subscriptionEnd = row.getValue("subscriptionEnd") as string | null
            return subscriptionEnd ? format(new Date(subscriptionEnd), 'PP') : 'Lifetime'
        },
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
        cell: ({ row }) => format(new Date(row.getValue("createdAt")), 'PP'),
    },
    {
        id: "actions",
        cell: OrganizationActionsCell,
    },
]