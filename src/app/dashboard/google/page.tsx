import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoogleBusinessLinker } from "@/components/google-business-linker";

export default async function GoogleBusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: stylist } = await supabase
    .from("stylists")
    .select(
      "business_name, city, state, google_place_id, google_rating, google_review_count, google_synced_at"
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!stylist) redirect("/onboarding/stylist");

  const defaultQuery = [stylist.business_name, stylist.city, stylist.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">Google reviews</h1>
      <p className="mt-1 text-sm text-muted">
        Link your real Google Business Profile so clients see your actual
        rating and reviews on your Chairside page.
      </p>

      <div className="mt-8">
        <GoogleBusinessLinker
          defaultQuery={defaultQuery}
          linked={
            stylist.google_place_id
              ? {
                  placeId: stylist.google_place_id,
                  rating: stylist.google_rating,
                  reviewCount: stylist.google_review_count,
                  syncedAt: stylist.google_synced_at,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
