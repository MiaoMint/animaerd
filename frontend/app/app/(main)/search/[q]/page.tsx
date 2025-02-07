/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { artworkApi } from "@/api/artwork";
import ArtworkGridTile from "@/components/artwork-grid-tile";
import { SearchArtworksGrid } from "@/components/search-artworks-grid";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import { Loader } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function SearchPage({
  params: { q },
}: {
  params: { q: string };
}) {
  return <SearchArtworksGrid q={q} />;
}
