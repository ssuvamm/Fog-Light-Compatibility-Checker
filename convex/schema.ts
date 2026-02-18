import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
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
  }).index("by_light_id", ["id"]),
  reports: defineTable({
    visitorId: v.string(),
    html: v.string(),
    createdAt: v.number(),
  }).index("by_visitor", ["visitorId"]),
});
