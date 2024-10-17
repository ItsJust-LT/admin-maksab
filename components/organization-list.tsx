"use client"

import { useState, useEffect } from 'react'
import { DataTable } from '@/app/(dashboard)/organizations/data-table'
import { columns } from '@/app/(dashboard)/organizations/columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getOrganizations, createOrganization, Organization } from '@/app/(dashboard)/organizations/actions'
import { useRouter } from 'next/navigation'
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

interface OrganizationsListProps {
  initialOrganizations: Organization[]
  initialTotalCount: number
}

export function OrganizationsList({ initialOrganizations, initialTotalCount }: OrganizationsListProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgSlug, setNewOrgSlug] = useState("")
  const router = useRouter()

  const fetchOrganizations = async (query: string = "") => {
    setIsLoading(true)
    try {
      const { organizations: fetchedOrganizations, totalCount: fetchedTotalCount } = await getOrganizations({
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
      await createOrganization(newOrgName, newOrgSlug, "current_user_id") // Replace with actual user ID
      setIsAddDialogOpen(false)
      setNewOrgName("")
      setNewOrgSlug("")
      fetchOrganizations(searchQuery)
      router.refresh()
    } catch (error) {
      console.error("Error adding organization:", error)
    } finally {
      setIsLoading(false)
    }
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
                Create a new organization here. Click save when you're done.
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
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slug" className="text-right">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    className="col-span-3"
                  />
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
      <DataTable
        columns={columns}
        data={organizations}
        onSearch={handleSearch}
      />
      {totalCount > 10 && (
        <div className="flex justify-center">
          <Button onClick={() => fetchOrganizations(searchQuery)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}