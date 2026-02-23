"use client";

import { Suspense } from "react";
import FogLightTool from "@/components/FogLightTool";

export default function LuxTool() {
  return (
    <Suspense fallback={null}>
      <FogLightTool />
    </Suspense>
  );
}