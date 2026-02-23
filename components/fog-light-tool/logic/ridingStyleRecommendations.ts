import type { FogLight, ToolState } from "../types";

type RidingStyleInputs = Pick<
  ToolState,
  "terrain" | "speed" | "wearsGlasses" | "leftEye" | "rightEye"
>;

function toEyePower(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function hasSevereNegativePower({
  wearsGlasses,
  leftEye,
  rightEye,
}: RidingStyleInputs) {
  if (!wearsGlasses) return false;

  const left = toEyePower(leftEye);
  const right = toEyePower(rightEye);
  return (left !== null && left < -2) || (right !== null && right < -2);
}

function isX1(light: FogLight) {
  const key = `${light.id} ${light.name}`.toLowerCase();
  return key.includes("x1");
}

function isX2(light: FogLight) {
  const key = `${light.id} ${light.name}`.toLowerCase();
  return key.includes("x2");
}

function pickX1AndX2(lights: FogLight[]) {
  const x1 = lights.find(isX1);
  const x2 = lights.find(isX2);
  return { x1, x2 };
}

function fallbackByRating(lights: FogLight[]) {
  return [...lights].sort((a, b) => b.rating - a.rating);
}

function compactList(
  primary?: FogLight,
  secondary?: FogLight,
  fallback?: FogLight[],
) {
  const selected = [primary, secondary].filter(Boolean) as FogLight[];
  if (selected.length > 0) return selected;
  return fallback ?? [];
}

export function rankRidingStyleLights(
  lights: FogLight[],
  inputs: RidingStyleInputs,
) {
  const { x1, x2 } = pickX1AndX2(lights);
  const fallback = fallbackByRating(lights);

  if (inputs.terrain === "city") {
    return compactList(x1, undefined, fallback);
  }

  if (inputs.speed === "0-50" || inputs.speed === "50-80") {
    return compactList(x1, undefined, fallback);
  }

  if (inputs.speed === "100-140") {
    return compactList(x2, x1, fallback);
  }

  if (inputs.speed === "80-100") {
    if (hasSevereNegativePower(inputs)) {
      return compactList(x2, x1, fallback);
    }
    return compactList(x1, x2, fallback);
  }

  return compactList(x1, x2, fallback);
}
