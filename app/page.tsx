import type { Metadata } from "next";
import { Suspense } from "react";
import FogLightTool from "@/components/FogLightTool";

export const metadata: Metadata = {
  title: "MotoLight - Motorcycle Fog Light Selection Tool",
  description:
    "Configure bike details, riding conditions, and electrical load to find safe fog light setup.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <Suspense fallback={null}>
      <FogLightTool />
    </Suspense>
  );
}
