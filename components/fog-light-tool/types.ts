import type { MutableRefObject } from "react";

export type Bike = {
  make: string;
  models: {
    name: string;
    years: {
      year: number;
      alternatorOutput: number;
      stockLoad: number;
    }[];
  }[];
};

export type FogLight = {
  id: string;
  name: string;
  loadWatts: number;
  lumens: string;
  imageUrl: string;
  rating: number;
};

export type ToolState = {
  recommendationMode: "style" | "capacity";
  recommendationIndex: number;
  visitorId: string;
  make: string;
  model: string;
  year: number;
  existingLoad: number;
  fogFrequency: "frequently" | "occasionally" | "no";
  speed: "0-50" | "50-80" | "80-110" | "110+";
  terrain: "city" | "highway" | "mixed" | "hilly";
  wearsGlasses: boolean;
  leftEye: string;
  rightEye: string;
  beamColor: "amber" | "white";
  checkedUsage: boolean;
};

export type SetToolState = (values: Partial<ToolState>) => Promise<unknown>;

export type CapacityData = {
  alternatorOutput: number;
  stockLoad: number;
  safeMargin: number;
  recommendedMax: number;
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
