"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { searchPlaces, getPlaceDetails, type PlaceCandidate } from "@/lib/google/places";

export type SearchState =
  | { candidates: PlaceCandidate[]; query: string; error?: undefined }
  | { error: string; candidates?: undefined; query?: undefined }
  | null;

export type GoogleActionState = { error?: string; success?: boolean } | null;

async function requireStylist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function searchGooglePlaces(
  _prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  await requireStylist();
  const query = String(formData.get("query") ?? "").trim();
  const result = await searchPlaces(query);
  if ("error" in result) return { error: result.error };
  if (result.length === 0) {
    return { error: "No matching businesses found on Google. Try a fuller name or add the city." };
  }
  return { candidates: result, query };
}

export async function linkGooglePlace(
  _prevState: GoogleActionState,
  formData: FormData
): Promise<GoogleActionState> {
  const { supabase, userId } = await requireStylist();
  const placeId = String(formData.get("place_id") ?? "");
  if (!placeId) return { error: "Missing place ID." };

  const details = await getPlaceDetails(placeId);
  if ("error" in details) return { error: details.error };

  const { error } = await supabase
    .from("stylists")
    .update({
      google_place_id: details.placeId,
      google_rating: details.rating,
      google_review_count: details.userRatingCount,
      google_reviews: details.reviews,
      google_synced_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/google");
  revalidatePath(`/stylists/${userId}`);
  return { success: true };
}

export async function syncGoogleReviews(): Promise<GoogleActionState> {
  const { supabase, userId } = await requireStylist();

  const { data: stylist } = await supabase
    .from("stylists")
    .select("google_place_id")
    .eq("id", userId)
    .single();

  if (!stylist?.google_place_id) {
    return { error: "No Google Business Profile linked yet." };
  }

  const details = await getPlaceDetails(stylist.google_place_id);
  if ("error" in details) return { error: details.error };

  const { error } = await supabase
    .from("stylists")
    .update({
      google_rating: details.rating,
      google_review_count: details.userRatingCount,
      google_reviews: details.reviews,
      google_synced_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/google");
  revalidatePath(`/stylists/${userId}`);
  return { success: true };
}

export async function unlinkGooglePlace(): Promise<GoogleActionState> {
  const { supabase, userId } = await requireStylist();

  const { error } = await supabase
    .from("stylists")
    .update({
      google_place_id: null,
      google_rating: null,
      google_review_count: null,
      google_reviews: [],
      google_synced_at: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/google");
  revalidatePath(`/stylists/${userId}`);
  return { success: true };
}
