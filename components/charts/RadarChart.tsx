"use client";
import { normalizeScore } from "@/lib/normalize";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function RadarChart({ insights }: { insights: Record<string, { score: number }> }) {
    const data = Object.entries(insights).map(([key, value]) => ({
        subject: key,
        value: normalizeScore(value.score),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
                <PolarRadiusAxis domain={[1, 10]} tick={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value} / 10`, "Team Feedback Insights"]} />
                <Radar
                    dataKey="value"
                    fill="rgba(99, 102, 241, 0.2)"
                    stroke="rgba(99, 102, 241, 1)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "rgba(99, 102, 241, 1)", strokeWidth: 0 }}
                />
            </RechartsRadar>
        </ResponsiveContainer>
    );
}