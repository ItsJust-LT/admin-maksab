"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUsers, User } from '@/app/(dashboard)/users/actions'
import { DataTable } from '@/app/(dashboard)/users/data-table'
import { columns } from '@/app/(dashboard)/users/columns'
import { AddUserDialog } from './add-user-dialog'

export function UserList({ initialUsers, initialTotalCount }: { initialUsers: User[], initialTotalCount: number }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { users: fetchedUsers, totalCount: fetchedTotalCount } = await getUsers({
        limit: usersPerPage,
        offset: (currentPage - 1) * usersPerPage,
        query: searchQuery,
      })

      // Ensure fetched data is plain and serializable
      const users = JSON.parse(JSON.stringify(fetchUsers));

      setUsers(users)
      setTotalCount(fetchedTotalCount)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <AddUserDialog />
      </div>
      <DataTable
        columns={columns}
        data={users}
        onSearch={handleSearch}
      />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {Math.min((currentPage - 1) * usersPerPage + 1, totalCount)} - {Math.min(currentPage * usersPerPage, totalCount)} of {totalCount} users
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * usersPerPage >= totalCount || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
