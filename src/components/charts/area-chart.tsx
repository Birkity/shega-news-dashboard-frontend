'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  [key: string]: string | number;
}

interface AreaConfig {
  dataKey: string;
  color: string;
  name: string;
  fillOpacity?: number;
  stackId?: string;
}

interface AreaChartComponentProps {
  data: DataPoint[];
  areas: AreaConfig[];
  xAxisKey: string;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatXAxis?: (value: string) => string;
  formatTooltip?: (value: number) => string;
  gradient?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
  formatValue?: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatValue,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="mb-2 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {formatValue ? formatValue(entry.value as number) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AreaChartComponent({
  data,
  areas,
  xAxisKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  formatXAxis,
  formatTooltip,
  gradient = true,
}: AreaChartComponentProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        {gradient && (
          <defs>
            {areas.map((area) => (
              <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={area.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
        )}
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
        )}
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="text-muted-foreground" />
        <Tooltip content={<CustomTooltip formatValue={formatTooltip} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />}
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            fill={gradient ? `url(#gradient-${area.dataKey})` : area.color}
            fillOpacity={area.fillOpacity || 1}
            strokeWidth={2}
            stackId={area.stackId}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-0">{chart}</CardContent>
      </Card>
    );
  }

  return chart;
}
