"use client";
import { normalizeScore } from "@/lib/normalize";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";

export default function BarChart({ insights }: { insights: Record<string, { score: number }> }) {
    const data = Object.entries(insights).map(([key, value]) => ({
        name: key,
        value: normalizeScore(value.score),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={data} barSize={50}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip formatter={(value: number) => [`${value} / 10`, "Score"]} />
                <ReferenceLine y={5} stroke="#94a3b8" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={entry.value >= 5 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"}
                        />
                    ))}
                </Bar>
            </RechartsBar>
        </ResponsiveContainer>
    );
}