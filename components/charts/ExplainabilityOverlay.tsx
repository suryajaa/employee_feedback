"use client";
import { normalizeScore } from "@/lib/normalize";

type DimensionData = { score: number; confidence: string; explanation: string };
type Props = { insights: Record<string, DimensionData> };

const DIMENSION_DETAILS: Record<string, {
    themes: { positive: string[]; neutral: string[]; negative: string[] };
    recommendations: { positive: string; neutral: string; negative: string };
}> = {
    teamwork: {
        themes: {
            positive: ["strong collaboration", "peer support", "shared goals", "team cohesion"],
            neutral: ["inconsistent cooperation", "mixed team dynamics", "variable collaboration"],
            negative: ["silos", "lack of cooperation", "poor coordination", "isolation"],
        },
        recommendations: {
            positive: "Keep fostering team rituals like standups and retrospectives to maintain this momentum.",
            neutral: "Consider structured team activities or pair programming sessions to strengthen collaboration.",
            negative: "Prioritize team-building initiatives and address any interpersonal conflicts directly.",
        },
    },
    communication: {
        themes: {
            positive: ["clear messaging", "open dialogue", "transparent updates", "active listening"],
            neutral: ["occasional miscommunication", "variable clarity", "inconsistent updates"],
            negative: ["communication gaps", "unclear direction", "lack of transparency", "information silos"],
        },
        recommendations: {
            positive: "Continue regular all-hands and async updates — the team values the clarity.",
            neutral: "Introduce structured communication channels and clearer documentation practices.",
            negative: "Establish a regular cadence of team updates and encourage open-door discussions.",
        },
    },
    support: {
        themes: {
            positive: ["strong mentorship", "management availability", "peer assistance", "psychological safety"],
            neutral: ["mixed support levels", "inconsistent availability", "variable mentorship"],
            negative: ["feeling overlooked", "lack of guidance", "insufficient resources", "burnout signals"],
        },
        recommendations: {
            positive: "Employees feel supported — keep 1:1 check-ins regular and maintain resource availability.",
            neutral: "Increase frequency of 1:1s and ensure employees know where to seek help.",
            negative: "Urgently review workload distribution and establish clear support structures and escalation paths.",
        },
    },
    efficiency: {
        themes: {
            positive: ["streamlined workflows", "productive use of time", "clear processes", "minimal blockers"],
            neutral: ["some process friction", "variable productivity", "occasional bottlenecks"],
            negative: ["process inefficiencies", "wasted time", "unclear ownership", "frequent blockers"],
        },
        recommendations: {
            positive: "Workflows are running smoothly — document current processes to help onboard new members.",
            neutral: "Audit current workflows to identify and remove recurring bottlenecks.",
            negative: "Conduct a process review session with the team to identify and eliminate key inefficiencies.",
        },
    },
    adaptability: {
        themes: {
            positive: ["embracing change", "resilience", "flexible mindset", "quick learning"],
            neutral: ["mixed reactions to change", "variable flexibility", "cautious adaptation"],
            negative: ["resistance to change", "change fatigue", "rigid processes", "low morale during transitions"],
        },
        recommendations: {
            positive: "The team adapts well — leverage this by gradually introducing new tools or processes.",
            neutral: "Communicate the reasoning behind changes more clearly to ease adaptation.",
            negative: "Slow down the pace of change, involve the team in decisions, and provide more transition support.",
        },
    },
    performance: {
        themes: {
            positive: ["meeting expectations", "high output quality", "goal achievement", "strong accountability"],
            neutral: ["inconsistent output", "variable quality", "mixed goal completion"],
            negative: ["performance concerns", "missed targets", "low motivation", "unclear expectations"],
        },
        recommendations: {
            positive: "Performance is strong — consider recognizing top contributors to sustain motivation.",
            neutral: "Clarify performance expectations and set measurable short-term goals with the team.",
            negative: "Review role clarity, set achievable milestones, and provide targeted coaching where needed.",
        },
    },
};

export default function ExplainabilityOverlay({ insights }: Props) {
    return (
        <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
            <h2 className="text-xl font-semibold">How to Interpret These Insights</h2>
            <p className="text-sm text-muted-foreground">
                These insights are derived from aggregated, privacy-preserving signals.
                No individual feedback is visible or stored.
            </p>
            <div className="space-y-6">
                {Object.entries(insights).map(([dimension, data]) => {
                    const details = DIMENSION_DETAILS[dimension];
                    if (!details) return null;

                    const normalized = normalizeScore(data.score);
                    const level = normalized >= 6.5 ? "positive" : normalized < 5 ? "negative" : "neutral";
                    const themes = details.themes[level];
                    const recommendation = details.recommendations[level];

                    const levelColors = {
                        positive: "bg-green-500/10 text-green-600 border-green-200",
                        neutral: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
                        negative: "bg-red-500/10 text-red-600 border-red-200",
                    };

                    return (
                        <div key={dimension} className="border rounded-lg p-5 bg-background space-y-3">
                            {/* Dimension header */}
                            <div className="flex items-center justify-between">
                                <p className="font-semibold capitalize text-base">{dimension}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[level]}`}>
                                        {normalized} / 10
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {data.confidence} confidence
                                    </span>
                                </div>
                            </div>

                            {/* Explanation */}
                            <p className="text-sm text-muted-foreground">{data.explanation}</p>

                            {/* Themes */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Related Themes
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {themes.map((theme) => (
                                        <span
                                            key={theme}
                                            className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                                        >
                                            {theme}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className={`text-sm px-4 py-3 rounded-lg border ${levelColors[level]}`}>
                                <span className="font-medium">Recommendation: </span>
                                {recommendation}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}