import type { Bike, FogLight } from "./types";

export const STATIC_BIKES: Bike[] = [
  {
    make: "BMW Motorrad",
    models: [
      {
        name: "R1250GS",
        years: [
          { year: 2023, alternatorOutput: 510, stockLoad: 340 },
          { year: 2024, alternatorOutput: 520, stockLoad: 345 },
        ],
      },
    ],
  },
  {
    make: "Honda",
    models: [
      {
        name: "Africa Twin",
        years: [
          { year: 2023, alternatorOutput: 490, stockLoad: 330 },
          { year: 2024, alternatorOutput: 500, stockLoad: 335 },
        ],
      },
    ],
  },
  {
    make: "KTM",
    models: [
      {
        name: "1290 Super Adventure",
        years: [
          { year: 2023, alternatorOutput: 480, stockLoad: 320 },
          { year: 2024, alternatorOutput: 485, stockLoad: 325 },
        ],
      },
    ],
  },
  {
    make: "Kawasaki",
    models: [
      {
        name: "Versys 1000",
        years: [
          { year: 2023, alternatorOutput: 470, stockLoad: 315 },
          { year: 2024, alternatorOutput: 475, stockLoad: 320 },
        ],
      },
    ],
  },
];

export const STATIC_FOG_LIGHTS: FogLight[] = [
  {
    id: "x1-plus-pro",
    name: "X1 Plus Pro",
    loadWatts: 40,
    lumens: "8,500 LM",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvrdeQpDjQLtrTWi2vpG7YSo2wpjuHRwdKz3Y0OwZVtyGbAlZIIciF_a492zSj22WvLhCEN6DWxAHzlnebtm6eGOQFowebe7SLyP2ACPoeCG9Wh7dzYczYX5_ExYDivN6O4EK3ZTDvUiKitkGSYhji0qWk99P5mcgBUfEZSlIjxGvfeWEcD6aNsyBeunXvI02UWKuZDqFeRA9-2ta8N36y1CD-Ab3BNZbqzT6mAIObhoHn8MlTgdGsSnH6QOvQz4chBwPk1wr12pP",
    rating: 4.5,
  },
  {
    id: "s2-evo",
    name: "S2 Evo",
    loadWatts: 24,
    lumens: "5,600 LM",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvrdeQpDjQLtrTWi2vpG7YSo2wpjuHRwdKz3Y0OwZVtyGbAlZIIciF_a492zSj22WvLhCEN6DWxAHzlnebtm6eGOQFowebe7SLyP2ACPoeCG9Wh7dzYczYX5_ExYDivN6O4EK3ZTDvUiKitkGSYhji0qWk99P5mcgBUfEZSlIjxGvfeWEcD6aNsyBeunXvI02UWKuZDqFeRA9-2ta8N36y1CD-Ab3BNZbqzT6mAIObhoHn8MlTgdGsSnH6QOvQz4chBwPk1wr12pP",
    rating: 4.1,
  },
  {
    id: "rally-max",
    name: "Rally Max",
    loadWatts: 58,
    lumens: "12,000 LM",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvrdeQpDjQLtrTWi2vpG7YSo2wpjuHRwdKz3Y0OwZVtyGbAlZIIciF_a492zSj22WvLhCEN6DWxAHzlnebtm6eGOQFowebe7SLyP2ACPoeCG9Wh7dzYczYX5_ExYDivN6O4EK3ZTDvUiKitkGSYhji0qWk99P5mcgBUfEZSlIjxGvfeWEcD6aNsyBeunXvI02UWKuZDqFeRA9-2ta8N36y1CD-Ab3BNZbqzT6mAIObhoHn8MlTgdGsSnH6QOvQz4chBwPk1wr12pP",
    rating: 4.8,
  },
  {
    id: "urban-lite",
    name: "Urban Lite",
    loadWatts: 18,
    lumens: "3,600 LM",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvrdeQpDjQLtrTWi2vpG7YSo2wpjuHRwdKz3Y0OwZVtyGbAlZIIciF_a492zSj22WvLhCEN6DWxAHzlnebtm6eGOQFowebe7SLyP2ACPoeCG9Wh7dzYczYX5_ExYDivN6O4EK3ZTDvUiKitkGSYhji0qWk99P5mcgBUfEZSlIjxGvfeWEcD6aNsyBeunXvI02UWKuZDqFeRA9-2ta8N36y1CD-Ab3BNZbqzT6mAIObhoHn8MlTgdGsSnH6QOvQz4chBwPk1wr12pP",
    rating: 3.9,
  },
];

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function makeVisitorId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}`;
}
