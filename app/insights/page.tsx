import RadarChart from "@/components/charts/RadarChart";
import BarChart from "@/components/charts/BarChart";
import InsightsSummary from "@/components/charts/InsightsSummary";

async function getInsights() {
    const res = await fetch("http://localhost:8000/aggregate", {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch insights");
    return res.json();
}

export default async function InsightsPage() {
    const data = await getInsights();

    return (
        <div className="p-8 space-y-10">
            <h1 className="text-2xl font-bold">Team Feedback Insights</h1>

            <RadarChart insights={data.insights} />

            <BarChart insights={data.insights} />

            <InsightsSummary insights={data.insights} />
        </div>
    );
}
