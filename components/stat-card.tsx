"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, TicketCheck, CreditCard } from 'lucide-react'

const icons = {
    users: Users,
    building2: Building2,
    ticketCheck: TicketCheck,
    creditCard: CreditCard,
}

interface StatCardProps {
    title: string
    value: string
    change: string
    icon: keyof typeof icons
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
    const Icon = icons[icon]
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {change} from last month
                </p>
            </CardContent>
        </Card>
    )
}