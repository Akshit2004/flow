"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WorkloadStats {
    memberId: string;
    memberName: string;
    count: number;
}

interface WorkloadChartProps {
    data: WorkloadStats[];
}

export default function WorkloadChart({ data }: WorkloadChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No active workload found
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 40,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                        type="category" 
                        dataKey="memberName" 
                        width={100}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        interval={0}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="var(--primary, #3b82f6)" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
