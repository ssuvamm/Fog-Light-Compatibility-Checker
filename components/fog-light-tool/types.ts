import type { MutableRefObject } from "react";

export type Bike = {
  make: string;
  models: {
    name: string;
    years: {
      year: number;
      alternatorOutput: number;
      alternatorOutputApprox?: boolean;
      stockLoad: number;
      stockLoadApprox?: boolean;
      manualUrl?: string;
    }[];
  }[];
};

export type FogLight = {
  id: string;
  name: string;
  loadWatts: number;
  lux: string;
  imageUrl: string;
  rating: number;
  shopUrl: string;
};

export type ToolState = {
  step: number;
  recommendationMode: "style" | "capacity";
  recommendationIndex: number;
  visitorId: string;
  make: string;
  model: string;
  year: number;
  existingLoad: number;
  fogFrequency: "" | "frequently" | "occasionally" | "no";
  speed: "" | "0-50" | "50-80" | "80-100" | "100-140";
  terrain: "" | "city" | "highway" | "mixed" | "hilly";
  wearsGlasses: boolean;
  leftEye: string;
  rightEye: string;
  beamColor: "amber" | "white";
  checkedUsage: boolean;
};

export type SetToolState = (
  values: Partial<ToolState> | null,
) => Promise<unknown>;

export type CapacityData = {
  alternatorOutput: number;
  alternatorOutputApprox: boolean;
  stockLoad: number;
  stockLoadApprox: boolean;
  safeMargin: number;
  safeMarginApprox: boolean;
  recommendedMax: number;
  recommendedMaxApprox: boolean;
  loadPercent: number;
  status: "Optimized" | "Near Limit" | "Overloaded";
};

export type Step3Props = {
  state: ToolState;
  setState: SetToolState;
  bikes: Bike[];
  models: Bike["models"];
  years: Bike["models"][number]["years"];
  isVehicleConfigured: boolean;
  canRevealResults: boolean;
  capacity: CapacityData;
  electricalCapacityRef: MutableRefObject<HTMLDivElement | null>;
};

export type Step4Props = {
  state: ToolState;
  setState: SetToolState;
  canRevealResults: boolean;
};

export type Step5Props = {
  state: ToolState;
  setState: SetToolState;
  canRevealResults: boolean;
  fogLights: FogLight[];
  remainingWatts: number;
};
