import { normalizeScore, scoreLabel } from "@/lib/normalize";

export default function InsightsSummary({
    insights,
}: {
    insights: Record<string, { score: number; confidence: string; explanation: string }>;
}) {
    const strengths = Object.entries(insights)
        .filter(([, v]) => normalizeScore(v.score) >= 6.5)
        .map(([k]) => k);

    const improvements = Object.entries(insights)
        .filter(([, v]) => normalizeScore(v.score) < 5)
        .map(([k]) => k);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-green-600">Strengths</h3>
                <ul className="list-disc pl-5">
                    {strengths.map((s) => (
                        <li key={s}>
                            {s} <span className="text-sm text-muted-foreground">({normalizeScore(insights[s].score)} / 10 — {scoreLabel(normalizeScore(insights[s].score))})</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-red-600">Needs Improvement</h3>
                <ul className="list-disc pl-5">
                    {improvements.map((s) => (
                        <li key={s}>
                            {s} <span className="text-sm text-muted-foreground">({normalizeScore(insights[s].score)} / 10 — {scoreLabel(normalizeScore(insights[s].score))})</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}