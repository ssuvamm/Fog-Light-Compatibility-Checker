import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  bikes: defineTable({
    make: v.string(),
    models: v.array(
      v.object({
        name: v.string(),
        years: v.array(
          v.object({
            year: v.number(),
            alternatorOutput: v.number(),
            alternatorOutputApprox: v.optional(v.boolean()),
            stockLoad: v.number(),
            stockLoadApprox: v.optional(v.boolean()),
            manualUrl: v.optional(v.string()),
          }),
        ),
      }),
    ),
  }).index("by_make", ["make"]),
  fogLights: defineTable({
    id: v.string(),
    name: v.string(),
    loadWatts: v.number(),
    lux: v.string(),
    imageUrl: v.string(),
    rating: v.number(),
    shopUrl: v.string(),
    priceInr: v.optional(v.number()),
    fit: v.optional(v.object({
      speed: v.record(v.string(), v.number()),
      terrain: v.record(v.string(), v.number()),
      fog: v.record(v.string(), v.number()),
      beamColor: v.record(v.string(), v.number()),
    })),
    vision: v.optional(v.object({
      severeThreshold: v.number(),
      maxSpeedBySeverity: v.object({
        normal: v.number(),
        severe: v.number(),
      }),
    })),
  }).index("by_light_id", ["id"]),
  reports: defineTable({
    visitorId: v.string(),
    html: v.string(),
    toolState: v.optional(
      v.object({
        step: v.number(),
        recommendationMode: v.union(
          v.literal("style"),
          v.literal("capacity"),
        ),
        recommendationIndex: v.number(),
        visitorId: v.string(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        existingLoad: v.number(),
        fogFrequency: v.union(
          v.literal(""),
          v.literal("frequently"),
          v.literal("occasionally"),
          v.literal("no"),
        ),
        speed: v.union(
          v.literal(""),
          v.literal("0-50"),
          v.literal("50-80"),
          v.literal("80-100"),
          v.literal("100-140"),
        ),
        terrain: v.union(
          v.literal(""),
          v.literal("city"),
          v.literal("highway"),
          v.literal("mixed"),
          v.literal("hilly"),
        ),
        wearsGlasses: v.boolean(),
        leftEye: v.string(),
        rightEye: v.string(),
        beamColor: v.union(v.literal("amber"), v.literal("white")),
        checkedUsage: v.boolean(),
      }),
    ),
    capacity: v.optional(
      v.object({
        alternatorOutput: v.number(),
        alternatorOutputApprox: v.boolean(),
        stockLoad: v.number(),
        stockLoadApprox: v.boolean(),
        safeMargin: v.number(),
        safeMarginApprox: v.boolean(),
        recommendedMax: v.number(),
        recommendedMaxApprox: v.boolean(),
        loadPercent: v.number(),
        status: v.union(
          v.literal("Optimized"),
          v.literal("Near Limit"),
          v.literal("Overloaded"),
        ),
      }),
    ),
    featuredLight: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        loadWatts: v.number(),
        lux: v.string(),
        imageUrl: v.string(),
        rating: v.number(),
        shopUrl: v.string(),
        priceInr: v.optional(v.number()),
        fit: v.optional(v.object({
          speed: v.record(v.string(), v.number()),
          terrain: v.record(v.string(), v.number()),
          fog: v.record(v.string(), v.number()),
          beamColor: v.record(v.string(), v.number()),
        })),
        vision: v.optional(v.object({
          severeThreshold: v.number(),
          maxSpeedBySeverity: v.object({
            normal: v.number(),
            severe: v.number(),
          }),
        })),
      }),
    ),
    createdAt: v.number(),
  }).index("by_visitor", ["visitorId"]),
});
