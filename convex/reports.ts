import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveVisitorReport = mutation({
  args: {
    visitorId: v.string(),
    html: v.string(),
    toolState: v.object({
      step: v.number(),
      recommendationMode: v.union(v.literal("style"), v.literal("capacity")),
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
    capacity: v.object({
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
    featuredLight: v.object({
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("reports", {
      visitorId: args.visitorId,
      html: args.html,
      toolState: args.toolState,
      capacity: args.capacity,
      featuredLight: args.featuredLight,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const getReportById = query({
  args: {
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
