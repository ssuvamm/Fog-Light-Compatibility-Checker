"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "convex/react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useEffect, useMemo, useRef } from "react";
import { api } from "@/convex/_generated/api";
import {
  clamp,
  makeVisitorId,
} from "./fog-light-tool/data";
import Step1Introduction from "./fog-light-tool/steps/Step1Introduction";
import Step2ElectricalEducation from "./fog-light-tool/steps/Step2ElectricalEducation";
import Step3ElectricalCapacity from "./fog-light-tool/steps/Step3ElectricalCapacity";
import Step4RidingPattern from "./fog-light-tool/steps/Step4RidingPattern";
import Step5Recommendation from "./fog-light-tool/steps/Step5Recommendation";
import type { ToolState } from "./fog-light-tool/types";

const fogParser = parseAsStringLiteral(["frequently", "occasionally", "no"]);
const speedParser = parseAsStringLiteral(["0-50", "50-80", "80-110", "110+"]);
const terrainParser = parseAsStringLiteral([
  "city",
  "highway",
  "mixed",
  "hilly",
]);
const beamParser = parseAsStringLiteral(["amber", "white"]);
const recommendationModeParser = parseAsStringLiteral(["style", "capacity"]);

const STEP_TITLES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Moto Light",
  2: "Electrical Basics",
  3: "Capacity Setup",
  4: "Riding Pattern",
  5: "Recommendation",
};

function clampStep(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return value as 1 | 2 | 3 | 4 | 5;
}

export default function FogLightTool() {
  const [state, setState] = useQueryStates(
    {
      step: parseAsInteger.withDefault(1),
      recommendationMode: recommendationModeParser.withDefault("style"),
      recommendationIndex: parseAsInteger.withDefault(0),
      visitorId: parseAsString.withDefault(""),
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      year: parseAsInteger.withDefault(0),
      existingLoad: parseAsInteger.withDefault(0),
      fogFrequency: fogParser.withDefault("frequently"),
      speed: speedParser.withDefault("50-80"),
      terrain: terrainParser.withDefault("highway"),
      wearsGlasses: parseAsBoolean.withDefault(false),
      leftEye: parseAsString.withDefault(""),
      rightEye: parseAsString.withDefault(""),
      beamColor: beamParser.withDefault("amber"),
      checkedUsage: parseAsBoolean.withDefault(false),
    },
    {
      history: "replace",
      shallow: true,
      clearOnDefault: true,
    },
  );

  const typedState = state as ToolState & { step: number };
  const currentStep = clampStep(typedState.step || 1);
  const electricalCapacityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!typedState.visitorId) {
      void setState({ visitorId: makeVisitorId() });
    }
  }, [setState, typedState.visitorId]);

  const liveBikes = useQuery(api.bikes.listBikes);
  const liveFogLights = useQuery(api.fogLights.listFogLights);
  const bikeSource = useMemo(() => liveBikes ?? [], [liveBikes]);
  const fogLightSource = useMemo(() => liveFogLights ?? [], [liveFogLights]);

  const models = useMemo(
    () =>
      bikeSource.find((bike) => bike.make === typedState.make)?.models ?? [],
    [bikeSource, typedState.make],
  );
  const years = useMemo(
    () => models.find((model) => model.name === typedState.model)?.years ?? [],
    [models, typedState.model],
  );

  const selectedYear = years.find(
    (entry) => entry.year === typedState.year,
  ) ?? {
    alternatorOutput: 510,
    alternatorOutputApprox: false,
    stockLoad: 340,
    stockLoadApprox: false,
  };
  const alternatorOutput = selectedYear.alternatorOutput;
  const alternatorOutputApprox = Boolean(selectedYear.alternatorOutputApprox);
  const stockLoad = selectedYear.stockLoad;
  const stockLoadApprox = Boolean(selectedYear.stockLoadApprox);
  const safeMargin = alternatorOutput - stockLoad - typedState.existingLoad;
  const derivedApprox = alternatorOutputApprox || stockLoadApprox;
  const recommendedMax = Math.max(0, Math.floor(safeMargin * 0.9));
  const loadPercent = clamp(
    ((stockLoad + typedState.existingLoad + Math.min(recommendedMax, 40)) /
      alternatorOutput) *
      100,
    0,
    100,
  );

  const status =
    loadPercent <= 70
      ? "Optimized"
      : loadPercent <= 90
        ? "Near Limit"
        : "Overloaded";
  const isVehicleConfigured = Boolean(
    typedState.make && typedState.model && typedState.year,
  );
  const canRevealResults = typedState.checkedUsage && isVehicleConfigured;

  useEffect(() => {
    if (currentStep < 3 || !canRevealResults) {
      return;
    }
    const id = requestAnimationFrame(() => {
      electricalCapacityRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [currentStep, canRevealResults]);

  const goToStep = (step: number) => void setState({ step: clampStep(step) });
  const canGoNext = currentStep === 3 ? canRevealResults : currentStep < 5;

  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-4 pt-6 pb-28">
      <header
        className={`flex items-center ${currentStep > 1 ? "justify-between" : "justify-center"} py-2`}
      >
        {currentStep > 1 && (
          <button
            className={
              "rounded-full border border-border-dark p-2 cursor-pointer text-white"
            }
            onClick={() => goToStep(currentStep - 1)}
            aria-label="Go to previous step"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="text-center">
          <p className="text-lg font-bold">{STEP_TITLES[currentStep]}</p>
          <p className="text-xs text-white/50">Step {currentStep} of 5</p>
        </div>
        <div className="h-9 w-9" />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-12"
        >
          {currentStep === 1 && (
            <Step1Introduction onPrimaryAction={() => goToStep(2)} />
          )}
          {currentStep === 2 && <Step2ElectricalEducation />}
          {currentStep === 3 && (
            <Step3ElectricalCapacity
              state={typedState}
              setState={setState}
              bikes={bikeSource}
              models={models}
              years={years}
              isVehicleConfigured={isVehicleConfigured}
              canRevealResults={canRevealResults}
              electricalCapacityRef={electricalCapacityRef}
              capacity={{
                alternatorOutput,
                alternatorOutputApprox,
                stockLoad,
                stockLoadApprox,
                safeMargin,
                safeMarginApprox: derivedApprox,
                recommendedMax,
                recommendedMaxApprox: derivedApprox,
                loadPercent,
                status,
              }}
            />
          )}
          {currentStep === 4 && (
            <Step4RidingPattern
              state={typedState}
              setState={setState}
              canRevealResults={canRevealResults}
            />
          )}
          {currentStep === 5 && (
            <Step5Recommendation
              state={typedState}
              setState={setState}
              canRevealResults={canRevealResults}
              fogLights={fogLightSource}
              remainingWatts={safeMargin}
            />
          )}
        </motion.section>
      </AnimatePresence>

      {currentStep > 1 && currentStep < 5 && (
        <div className="fixed right-0 bottom-0 left-0 border-t border-white/10 bg-background-dark/85 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-background-dark/75">
          <div className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/3 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <button
              className={`flex-1 rounded-xl border border-border-dark py-3 text-sm font-bold ${currentStep > 1 ? "cursor-pointer text-white" : "cursor-not-allowed text-white/30"}`}
              disabled={currentStep === 1}
              onClick={() => goToStep(currentStep - 1)}
            >
              Back{currentStep === 4 ? ": Edit Capacity" : ""}
            </button>
            <button
              className={`flex-1 rounded-xl py-3 text-sm font-black ${canGoNext ? "cursor-pointer bg-primary text-background-dark" : "cursor-not-allowed bg-primary/30 text-background-dark/60"}`}
              disabled={!canGoNext}
              onClick={() => goToStep(currentStep + 1)}
            >
              Next
              {currentStep === 2
                ? ": Check Capacity"
                : currentStep === 3
                  ? ": Riding Pattern"
                  : ""}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
