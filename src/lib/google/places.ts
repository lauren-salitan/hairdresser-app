// Thin server-only wrapper around the Places API (New). Never import this
// from a client component — GOOGLE_PLACES_API_KEY must stay server-side.
//
// Google's ToS lets you cache Place data (including reviews) for up to 30
// days before it has to be refreshed or dropped — see
// https://developers.google.com/maps/documentation/places/web-service/policies#caching.
// We store a `google_synced_at` timestamp on the stylist row so the UI can
// prompt a re-sync well before that window closes.

const PLACES_BASE = "https://places.googleapis.com/v1";

export type PlaceCandidate = {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  userRatingCount: number | null;
};

export type PlaceReview = {
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
};

export type PlaceDetails = {
  placeId: string;
  name: string;
  rating: number | null;
  userRatingCount: number | null;
  reviews: PlaceReview[];
};

function getApiKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY || null;
}

/** Text-search for a business, e.g. "Ava Chen Hair Studio, Austin, TX". */
export async function searchPlaces(
  query: string
): Promise<PlaceCandidate[] | { error: string }> {
  const apiKey = getApiKey();
  if (!apiKey) return { error: "GOOGLE_PLACES_API_KEY isn't configured yet." };
  if (!query.trim()) return { error: "Enter a business name to search for." };

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { error: `Google Places search failed (${res.status}): ${body.slice(0, 200)}` };
  }

  const data = await res.json();
  const places = (data.places ?? []) as Array<{
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
  }>;

  return places.map((p) => ({
    placeId: p.id,
    name: p.displayName?.text ?? "Unknown business",
    address: p.formattedAddress ?? "",
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
  }));
}

/** Fetch rating + up to 5 review snippets for an already-known place_id. */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | { error: string }> {
  const apiKey = getApiKey();
  if (!apiKey) return { error: "GOOGLE_PLACES_API_KEY isn't configured yet." };

  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    return { error: `Google Place details failed (${res.status}): ${body.slice(0, 200)}` };
  }

  const data = await res.json();
  const reviews = (data.reviews ?? []) as Array<{
    authorAttribution?: { displayName?: string; photoUri?: string };
    rating?: number;
    text?: { text?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
  }>;

  return {
    placeId: data.id,
    name: data.displayName?.text ?? "",
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
    reviews: reviews.map((r) => ({
      authorName: r.authorAttribution?.displayName ?? "Google user",
      authorPhotoUrl: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? 0,
      text: r.text?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
      publishTime: r.publishTime ?? "",
    })),
  };
}
