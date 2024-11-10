"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/app/(dashboard)/organizations/data-table"
import { columns } from "@/app/(dashboard)/organizations/columns"

import {
  getOrganizations,
  createOrganization,
  Organization,
  Subscription,
} from "@/app/(dashboard)/organizations/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrganizationsListProps {
  initialOrganizations: Organization[]
  initialTotalCount: number
}

export function OrganizationsList({
  initialOrganizations,
  initialTotalCount,
}: OrganizationsListProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    nif: "",
    address: "",
    country: "",
    currency: "",
    subscription: "free" as Subscription,
  })
  const router = useRouter()

  const fetchOrganizations = async (query: string = "") => {
    setIsLoading(true)
    try {
      const { organizations: fetchedOrganizations, totalCount: fetchedTotalCount } =
        await getOrganizations({
          query,
          limit: 10,
          offset: 0,
        })
      setOrganizations(fetchedOrganizations)
      setTotalCount(fetchedTotalCount)
    } catch (error) {
      console.error("Error fetching organizations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations(searchQuery)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createOrganization(
        formData.name,
        formData.slug,
        "current_user_id", // Replace with actual user ID
        formData.email,
        formData.nif,
        formData.address,
        formData.country,
        formData.currency,
        formData.subscription
      )
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        slug: "",
        email: "",
        nif: "",
        address: "",
        country: "",
        currency: "",
        subscription: "free",
      })
      fetchOrganizations(searchQuery)
      router.refresh()
    } catch (error) {
      console.error("Error adding organization:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Organization</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add new organization</DialogTitle>
              <DialogDescription>
                Create a new organization here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrganization}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slug" className="text-right">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nif" className="text-right">
                    NIF
                  </Label>
                  <Input
                    id="nif"
                    value={formData.nif}
                    onChange={(e) => handleInputChange("nif", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="country" className="text-right">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subscription" className="text-right">
                    Subscription
                  </Label>
                  <Select
                    value={formData.subscription}
                    onValueChange={(value: Subscription) =>
                      handleInputChange("subscription", value)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="economic">Economic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add organization"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={organizations} onSearch={handleSearch} />
      {totalCount > 10 && (
        <div className="flex justify-center">
          <Button onClick={() => fetchOrganizations(searchQuery)}>Load More</Button>
        </div>
      )}
    </div>
  )
}