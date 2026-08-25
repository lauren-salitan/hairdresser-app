import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export async function GET() {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe) {
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=${encodeURIComponent(
        "Payments aren't configured yet. Add your Stripe test keys to enable payouts."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const { data: stylist } = await supabase
    .from("stylists")
    .select("id, stripe_account_id")
    .eq("id", user.id)
    .single();
  if (!stylist) return NextResponse.redirect(`${appUrl}/onboarding/stylist`);

  let accountId = stylist.stripe_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({ type: "express" });
    accountId = account.id;
    await supabase
      .from("stylists")
      .update({ stripe_account_id: accountId })
      .eq("id", user.id);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect`,
    return_url: `${appUrl}/dashboard`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
