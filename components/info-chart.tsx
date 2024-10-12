"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, LucideIcon, Users, Building2, TicketCheck, CreditCard } from "lucide-react";

interface ChartDataPoint {
  date: Date;
  [key: string]: number | Date;
}

interface ChartProps {
  className?: string;
  title: string;
  iconName: string;
  dataKey: string;
  color: string;
  data: ChartDataPoint[];
  formatType: 'number' | 'currency' | 'percentage' | 'custom';
  customFormat?: (value: number) => string;
  latestValue: number;  // New prop for latest value
  previousValue: number; // New prop for previous value
}

const iconMap: { [key: string]: LucideIcon } = {
  users: Users,
  building2: Building2,
  ticketCheck: TicketCheck,
  creditCard: CreditCard,
};

export function InfoChart({
  className,
  title,
  iconName,
  dataKey,
  color,
  data: initialData,
  formatType,
  customFormat,
  latestValue,    // Use latestValue from props
  previousValue,  // Use previousValue from props
}: ChartProps) {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("7");
  const [data, setData] = useState(initialData);

  const Icon = iconMap[iconName] || Users;

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const filteredData = initialData.slice(-parseInt(value));
    setData(filteredData);
  };

  const valueFormatter = (value: number): string => {
    switch (formatType) {
      case 'number':
        return value.toLocaleString();
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'custom':
        return customFormat ? customFormat(value) : value.toString();
      default:
        return value.toString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentData = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md shadow-sm p-2 text-xs">
          <p className="font-semibold">{format(new Date(currentData.date), "MMM d, yyyy")}</p>
          <p className="text-primary">{valueFormatter(currentData[dataKey])}</p>
        </div>
      );
    }
    return null;
  };

  console.log(data);

  const valueChange = latestValue - previousValue;
  const valueChangePercentage = previousValue > 0 ? ((valueChange / previousValue) * 100).toFixed(2) : 0;

  const processedData = useMemo(() => {
    return data.map((entry) => ({
      ...entry,
      date: new Date(entry.date), // Ensure date is a Date object
      name: format(new Date(entry.date), "d"),
    }));
  }, [data]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span>{title}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          <div className="text-2xl font-bold">{valueFormatter(latestValue)}</div>
          <p className="text-xs text-muted-foreground">
            {valueChange >= 0 ? "+" : "-"}{valueFormatter(Math.abs(valueChange))} ({valueChangePercentage}%)
            <span className={`inline-block ml-1 ${valueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </p>
        </div>
        <div className="mt-4">
          <ChartContainer
            config={{
              [dataKey]: {
                label: title,
                color: color,
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                <defs>
                  <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "Days", position: "bottom", offset: 20, fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={valueFormatter}
                  label={{ value: title, angle: -90, position: "insideLeft", offset: -20, fill: "hsl(var(--foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#color${dataKey})`}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: color,
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
