'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

interface DonutChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
  centerLabel?: string;
  centerValue?: string | number;
}

const COLORS = ['#2563eb', '#dc2626', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      fill: string;
      percent?: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Count: <span className="font-medium text-foreground">{data.value}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Percentage:{' '}
          <span className="font-medium text-foreground">
            {((data.payload.percent || 0) * 100).toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function DonutChart({
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  colors = COLORS,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
          />
        )}
        {/* Center label */}
        {(centerLabel || centerValue) && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
          >
            {centerValue && (
              <tspan x="50%" dy="-0.5em" className="text-2xl font-bold">
                {centerValue}
              </tspan>
            )}
            {centerLabel && (
              <tspan x="50%" dy={centerValue ? '1.5em' : '0'} className="text-sm fill-muted-foreground">
                {centerLabel}
              </tspan>
            )}
          </text>
        )}
      </PieChart>
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
