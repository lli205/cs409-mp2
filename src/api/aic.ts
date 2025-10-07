// aic.ts

import client from "./client";
import type { AICResponse, Artwork } from "../types";
import axios from "axios";

export type ArtworkWithAlt = Artwork & { alt_image_ids?: string[] | null };

const FIELDS = [
  "id",
  "title",
  "artist_title",
  "date_display",
  "image_id",
  "alt_image_ids",
  "department_title",
  "classification_title",
].join(",");

export async function fetchArtworks(page = 1, limit = 50) {
  const res = await client.get<AICResponse>(`/artworks`, {
    params: { page, limit, fields: FIELDS },
  });
  return res.data;
}

export async function fetchArtworksPages(pages: number[], limit = 50) {
  const results: ArtworkWithAlt[] = [];
  for (const p of pages) {
    const data = await fetchArtworks(p, limit);
    results.push(...(data.data as ArtworkWithAlt[]));
  }
  const seen = new Set<number>();
  return results.filter(a => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}

export async function fetchArtwork(id: string | number) {
  const res = await client.get<{ data: ArtworkWithAlt }>(`/artworks/${id}`, {
    params: { fields: FIELDS },
  });
  return res.data.data;
}

export function imageUrl(image_id?: string | null, width = 600, fallback?: string) {
	if (image_id && image_id !== "null") {
		return `https://www.artic.edu/iiif/2/${image_id}/full/${width},/0/default.jpg`;
	}
	  	return fallback || "/fallback/default.jpg";
}

export function firstImageId(it: { image_id?: string | null; alt_image_ids?: string[] | null }) {
  return it.image_id ?? (it.alt_image_ids?.[0] ?? null);
}

// export function imageUrlFor(
//   it: { image_id?: string | null; alt_image_ids?: string[] | null },
//   width = 600
// ) {
//   const id = firstImageId(it);
//   return id ? imageUrl(id, width) : "";
// }

export function imageUrlFor(
	it: { image_id?: string | null; alt_image_ids?: string[] | null; fallback?: string },
	width = 600
) {
	const id = firstImageId(it);
	return imageUrl(id, width, it.fallback);
}
  

export async function searchAllArtworks(
  query: string,
  {
    limitPerPage = 50,
    maxPages = 50,
    maxResults = 1000,
    onlyWithImage = false,
    cancelToken,
  }: {
    limitPerPage?: number;
    maxPages?: number;
    maxResults?: number;
    onlyWithImage?: boolean;
    cancelToken?: ReturnType<typeof axios.CancelToken.source>["token"];
  } = {}
) {
  const q = query.trim().toLowerCase();
  if (!q) return [] as ArtworkWithAlt[];

  const matches: ArtworkWithAlt[] = [];
  let page = 1;

  while (page <= maxPages) {
    const res = await client.get<AICResponse>(`/artworks`, {
      params: { page, limit: limitPerPage, fields: FIELDS },
      cancelToken,
    });

    const pageItems = res.data.data as ArtworkWithAlt[];
    for (const it of pageItems) {
      const hasAnyImage = !!firstImageId(it);
      if (onlyWithImage && !hasAnyImage) continue;
      const hay1 = (it.title || "").toLowerCase();
      const hay2 = (it.artist_title || "").toLowerCase();
      if (hay1.includes(q) || hay2.includes(q)) {
        matches.push(it);
        if (matches.length >= maxResults) return matches;
      }
    }

    const { current_page, total_pages } = res.data.pagination;
    if (current_page >= total_pages) break;
    page += 1;
  }

  return matches;
}
