export function normalizeScore(raw: number): number {
    // Assumes raw scores range roughly from -0.1 to +0.1
    // Maps to 1–10 scale with 5 as neutral
    const MIN_RAW = -0.1;
    const MAX_RAW = 0.1;
    const normalized = ((raw - MIN_RAW) / (MAX_RAW - MIN_RAW)) * 9 + 1;
    return parseFloat(Math.min(10, Math.max(1, normalized)).toFixed(1));
}

export function scoreLabel(score: number): string {
    if (score >= 8) return "Strong";
    if (score >= 6.5) return "Good";
    if (score >= 5) return "Neutral";
    if (score >= 3.5) return "Concerning";
    return "Needs Attention";
}