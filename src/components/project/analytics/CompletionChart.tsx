"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DailyCompletion {
    date: string;
    count: number;
}

interface CompletionChartProps {
    data: DailyCompletion[];
}

export default function CompletionChart({ data }: CompletionChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No completion data
            </div>
        );
    }

    const formattedData = data.map(d => ({
        ...d,
        dayName: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        fullDate: new Date(d.date).toLocaleDateString()
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={formattedData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="dayName" 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                        ))}
                    </Bar>
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary, #3b82f6)" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
