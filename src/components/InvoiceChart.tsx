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
} from 'recharts';
import { InvoiceItem } from '../types';

interface InvoiceChartProps {
  items: InvoiceItem[];
}

export function InvoiceChart({ items }: InvoiceChartProps) {
  const chartData = items
    .map((item) => ({
      name: item.description.split(' ')[0], // Use first word for readability
      quantity: item.quantity,
      total: Number((item.quantity * item.price).toFixed(2)),
    }))
    .sort((a, b) => b.total - a.total) // Sort by total value
    .slice(0, 10); // Show top 10 items

  return (
    <div className="h-96 w-full">
      <h4 className="text-sm font-medium text-gray-700 mb-4">Top 10 Items by Value</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
            stroke="#666"
          />
          <YAxis 
            yAxisId="left" 
            stroke="#8884d8"
            label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#82ca9d"
            label={{ value: 'Total ($)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="quantity" 
            fill="#8884d8" 
            name="Quantity"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="right" 
            dataKey="total" 
            fill="#82ca9d" 
            name="Total ($)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}