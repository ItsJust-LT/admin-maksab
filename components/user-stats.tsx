"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Label } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, UserMinus, UserPlus } from "lucide-react"
import { PolarViewBox } from 'recharts/types/util/types'

interface UserStatsProps {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsers: number
}

export function UserStats({ totalUsers, activeUsers, inactiveUsers, newUsers }: UserStatsProps) {
  const chartData = React.useMemo(() => [
    { name: "Active Users", value: activeUsers, icon: Users, fill: "var(--color-active)" },
    { name: "Inactive Users", value: inactiveUsers, icon: UserMinus, fill: "var(--color-inactive)" },
    { name: "New Users", value: newUsers, icon: UserPlus, fill: "var(--color-new)" },
  ], [activeUsers, inactiveUsers, newUsers])

  const chartConfig = {
    users: { label: "Users" },
    active: { label: "Active", color: "hsl(var(--chart-1))" },
    inactive: { label: "Inactive", color: "hsl(var(--chart-2))" },
    new: { label: "New", color: "hsl(var(--chart-3))" },
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="items-center pb-2">
        <CardTitle>User Statistics</CardTitle>
        <CardDescription>Active, Inactive, and New Users</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4">
        <div className="grid grid-cols-3 gap-4 mb-6 w-full">
          {chartData.map((entry, index) => (
            <div key={`stat-${index}`} className="flex flex-col items-center justify-center">
              <entry.icon className="w-5 h-5 mb-1" style={{ color: entry.fill }} />
              <span className="text-sm font-medium">{entry.name}</span>
              <span className="text-lg font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig} className="w-full aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as PolarViewBox
                  return (
                    <text x={cx} y={cy} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="central">
                      <tspan x={cx} y={cy || 0 - 10} className="text-2xl font-bold">
                        {totalUsers}
                      </tspan>
                      <tspan x={cx} y={cy || 0 + 15} className="text-sm fill-muted-foreground">
                        Total Users
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}