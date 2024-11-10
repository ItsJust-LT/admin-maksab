"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Organization, Subscription, updateSubscription, deleteOrganization } from "./actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function OrganizationActionsCell({ row }: { row: any }) {
  const organization = row.original
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSubscription, setNewSubscription] = useState<Subscription>(organization.subscription.plan)
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(
    organization.subscription.endDate ? new Date(organization.subscription.endDate) : undefined
  )
  const [newFreeTrial, setNewFreeTrial] = useState(organization.subscription.freeTrial)
  const router = useRouter()

  const handleSubscriptionUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      await updateSubscription(
        organization.id,
        newSubscription,
        newSubscription === "vip" ? null : newEndDate?.toISOString() || null,
        newFreeTrial
      )
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating subscription:", error)
      alert("Failed to update subscription. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this organization?")) {
      setIsUpdating(true)
      try {
        await deleteOrganization(organization.id)
        router.refresh()
      } catch (error) {
        console.error("Error deleting organization:", error)
        alert("Failed to delete organization. Please try again.")
      } finally {
        setIsUpdating(false)
      }
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
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(organization.id)}
          >
            Copy organization ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            Manage Subscription
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={isUpdating}>
            Delete organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Update the organization's subscription details here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscriptionUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan" className="text-right">
                  Plan
                </Label>
                <Select
                  value={newSubscription}
                  onValueChange={(value: Subscription) => {
                    setNewSubscription(value)
                    if (value === "vip") {
                      setNewEndDate(undefined)
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="economic">Economic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newSubscription !== "vip" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !newEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEndDate ? format(newEndDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEndDate}
                        onSelect={setNewEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="freeTrial" className="text-right">
                  Free Trial
                </Label>
                <Switch
                  id="freeTrial"
                  checked={newFreeTrial}
                  onCheckedChange={setNewFreeTrial}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ViewButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      onClick={() => router.push(`/organizations/${id}`)}
    >
      <Eye className="h-4 w-4" />
    </Button>
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
    accessorKey: "image",
    header: "Logo",
    cell: ({ row }) => {
      const org = row.original
      return (
        <Avatar>
          <AvatarImage src={org.imageUrl} alt={`${org.name} logo`} />
          <AvatarFallback>{org.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "subscription",
    header: "Subscription",
    cell: ({ row }) => {
      const subscription = row.original.subscription
      const badgeVariants = {
        free: "bg-gray-200 text-gray-800",
        economic: "bg-green-200 text-green-800",
        premium: "bg-blue-200 text-blue-800",
        vip: "bg-purple-200 text-purple-800"
      }
      return (
        <Badge className={`${badgeVariants[subscription.plan]} font-semibold px-2 py-1 rounded-full`}>
          {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "subscription.endDate",
    header: "Subscription End",
    cell: ({ row }) => {
      const subscription = row.original.subscription
      return subscription.plan === "vip" ? "Lifetime" : (subscription.endDate ? format(new Date(subscription.endDate), "PP") : "N/A")
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
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PP"),
  },
  {
    id: "view",
    cell: ({ row }) => <ViewButton id={row.original.id} />,
  },
  {
    id: "actions",
    cell: OrganizationActionsCell,
  },
]