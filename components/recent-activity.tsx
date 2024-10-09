"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  { user: 'John Doe', action: 'created a new ticket', time: '2 hours ago' },
  { user: 'Jane Smith', action: 'updated their profile', time: '4 hours ago' },
  { user: 'Bob Johnson', action: 'subscribed to a new plan', time: '6 hours ago' },
  { user: 'Alice Brown', action: 'closed a ticket', time: '1 day ago' },
  { user: 'Charlie Wilson', action: 'joined a new organization', time: '2 days ago' },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${activity.user}`} alt="Avatar" />
                <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.action}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}