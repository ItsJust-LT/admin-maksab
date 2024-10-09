"use client"

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const tickets = [
  { id: 1, title: 'Cannot access dashboard', user: 'John Doe', priority: 'High', status: 'Open', created: '2023-06-01' },
  { id: 2, title: 'Payment failed', user: 'Jane Smith', priority: 'Medium', status: 'In Progress', created: '2023-06-02' },
  { id: 3, title: 'Feature request: Dark mode', user: 'Bob Johnson', priority: 'Low', status: 'Open', created: '2023-06-03' },
  { id: 4, title: 'App crashes on startup', user: 'Alice Brown', priority: 'High', status: 'Closed', created: '2023-06-04' },
  { id: 5, title: 'Need help with API integration', user: 'Charlie Wilson', priority: 'Medium', status: 'Open', created: '2023-06-05' },
]

export function SupportTicketList() {
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedTickets = [...tickets].sort((a, b) => {
    if (a[sortColumn as keyof typeof a] < b[sortColumn as keyof typeof b]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn as keyof typeof a] > b[sortColumn as keyof typeof b]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-500'
      case 'in progress': return 'bg-yellow-500'
      case 'closed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input className="max-w-sm" placeholder="Search tickets..." />
        <Button>Create Ticket</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('title')} className="cursor-pointer">
              Title <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('user')} className="cursor-pointer">
              User <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('priority')} className="cursor-pointer">
              Priority <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
              Status <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('created')} className="cursor-pointer">
              Created <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell>{ticket.user}</TableCell>
              <TableCell>
                <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>{ticket.created}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Assign ticket</DropdownMenuItem>
                    <DropdownMenuItem>Change status</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Close ticket</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}