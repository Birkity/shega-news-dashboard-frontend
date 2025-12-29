'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  color: string;
  name: string;
  stackId?: string;
}

interface BarChartComponentProps {
  data: DataPoint[];
  bars: BarConfig[];
  xAxisKey: string;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
  formatXAxis?: (value: string) => string;
  formatTooltip?: (value: number) => string;
  barSize?: number;
  colorByValue?: boolean;
  positiveColor?: string;
  negativeColor?: string;
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

export function BarChartComponent({
  data,
  bars,
  xAxisKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
  formatXAxis,
  formatTooltip,
  barSize,
  colorByValue = false,
  positiveColor = '#22c55e',
  negativeColor = '#ef4444',
}: BarChartComponentProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
        )}
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey={xAxisKey}
              type="category"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xAxisKey}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip formatValue={formatTooltip} />} />
        {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />}
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            stackId={bar.stackId}
            barSize={barSize}
            radius={[4, 4, 0, 0]}
          >
            {colorByValue &&
              data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={(entry[bar.dataKey] as number) >= 0 ? positiveColor : negativeColor}
                />
              ))}
          </Bar>
        ))}
      </BarChart>
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
