import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";

const REPORT_ID_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/;

export type PublicReport = {
  _id: string;
  toolState?: {
    make: string;
    model: string;
    year: number;
    fogFrequency: "" | "frequently" | "occasionally" | "no";
    speed: "" | "0-50" | "50-80" | "80-100" | "100-140";
    terrain: "" | "city" | "highway" | "mixed" | "hilly";
    existingLoad: number;
    recommendationMode: "style" | "capacity";
    recommendationIndex: number;
    checkedUsage: boolean;
  };
  capacity?: {
    alternatorOutput: number;
    stockLoad: number;
    recommendedMax: number;
  };
  featuredLight?: {
    name: string;
    loadWatts: number;
    lux: string;
    imageUrl: string;
  };
};

export function parseReportParam(value: string) {
  const trimmed = value.trim();
  if (!REPORT_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export async function getPublicReport(reportId: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;
  const parsed = parseReportParam(reportId);
  if (!parsed) return null;

  const client = new ConvexHttpClient(convexUrl);
  const report = await client.query(api.reports.getReportById, {
    id: parsed as Id<"reports">,
  });
  if (!report) return null;
  return report as PublicReport;
}
