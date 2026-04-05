// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/dashboard/SalesChart.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SalesChart = ({ data }) => {
  return (
    <div className="w-full bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col">
      <h3 className="text-lg font-medium text-gray-200 mb-6">Revenue Overview</h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            <YAxis 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `$${val}`} 
              dx={-10} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '0.5rem' }} 
              itemStyle={{ color: '#3B82F6', fontWeight: 600 }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '0.25rem' }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="#1d4ed8" 
              strokeWidth={3} 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#60A5FA' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
