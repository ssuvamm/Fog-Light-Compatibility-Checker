import type { Metadata } from "next";
import { Suspense } from "react";
import FogLightTool from "@/components/FogLightTool";
import {
  createLoader,
  createParser,
  createSerializer,
  type SearchParams,
} from "nuqs/server";

const seoTextRegex = /^[a-zA-Z0-9 .&+-]{1,60}$/;

const seoSearchParams = {
  make: createParser({
    parse(query) {
      const value = query.trim();
      if (!seoTextRegex.test(value)) {
        return null;
      }
      return value;
    },
    serialize(value) {
      return value;
    },
  }),
  model: createParser({
    parse(query) {
      const value = query.trim();
      if (!seoTextRegex.test(value)) {
        return null;
      }
      return value;
    },
    serialize(value) {
      return value;
    },
  }),
  year: createParser({
    parse(query) {
      const year = Number(query);
      if (!Number.isInteger(year) || year < 1980 || year > 2035) {
        return null;
      }
      return year;
    },
    serialize(value) {
      return String(value);
    },
  }),
};

const loadSeoSearchParams = createLoader(seoSearchParams);
const serializeSeoSearchParams = createSerializer(seoSearchParams);

type Props = {
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { make, model, year } = await loadSeoSearchParams(searchParams);
  const vehicle = [make, model, year].filter(Boolean).join(" ");
  const canonical = serializeSeoSearchParams("/", { make, model, year });

  return {
    title: vehicle
      ? `${vehicle} Fog Light Compatibility | MotoLight`
      : "MotoLight - Motorcycle Fog Light Selection Tool",
    description: vehicle
      ? `Fog light compatibility setup for ${vehicle}. Check safe electrical capacity and recommended watt range.`
      : "Configure bike details, riding conditions, and electrical load to find safe fog light setup.",
    alternates: {
      canonical,
    },
  };
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <FogLightTool />
    </Suspense>
  );
}
