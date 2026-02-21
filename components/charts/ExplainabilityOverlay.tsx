"use client";
import { normalizeScore, scoreLabel } from "@/lib/normalize";

type DimensionData = { score: number; confidence: string; explanation: string };
type Props = { insights: Record<string, DimensionData> };

const EXPLANATIONS: Record<string, { positive: string; neutral: string; negative: string }> = {
    teamwork: {
        positive: "Employees perceive strong collaboration and mutual support.",
        neutral: "Team collaboration appears inconsistent across employees.",
        negative: "There may be silos or lack of effective teamwork.",
    },
    communication: {
        positive: "Communication is generally clear and effective.",
        neutral: "Communication clarity varies across the team.",
        negative: "Communication gaps may be affecting alignment.",
    },
    support: {
        positive: "Employees feel supported by leadership and peers.",
        neutral: "Support levels appear mixed.",
        negative: "Employees may feel unsupported or overlooked.",
    },
    efficiency: {
        positive: "Workflows and processes are perceived as efficient.",
        neutral: "Efficiency perceptions are inconsistent.",
        negative: "Process inefficiencies may be impacting productivity.",
    },
    adaptability: {
        positive: "The team adapts well to change.",
        neutral: "Adaptability varies across situations.",
        negative: "Change management may need improvement.",
    },
    performance: {
        positive: "Overall performance perception is strong.",
        neutral: "Performance perception is mixed.",
        negative: "Performance concerns may exist within the team.",
    },
};

export default function ExplainabilityOverlay({ insights }: Props) {
    return (
        <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
            <h2 className="text-xl font-semibold">How to Interpret These Insights</h2>
            <p className="text-sm text-muted-foreground">
                These explanations are derived from aggregated, privacy-preserving signals. No individual feedback is visible or stored.
            </p>
            <div className="space-y-3">
                {Object.entries(insights).map(([dimension, data]) => {
                    const explanationSet = EXPLANATIONS[dimension];
                    if (!explanationSet) return null;
                    const normalized = normalizeScore(data.score);
                    const explanation = data.explanation || (
                        normalized >= 6.5 ? explanationSet.positive :
                            normalized < 5 ? explanationSet.negative :
                                explanationSet.neutral
                    );
                    return (
                        <div key={dimension}>
                            <p className="font-medium capitalize">
                                {dimension}
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({normalized} / 10 — {scoreLabel(normalized)} — {data.confidence} confidence)
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">{explanation}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}