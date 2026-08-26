"use client";

import { useActionState, useState, useTransition } from "react";
import {
  searchGooglePlaces,
  linkGooglePlace,
  syncGoogleReviews,
  unlinkGooglePlace,
  type SearchState,
  type GoogleActionState,
} from "@/lib/actions/google-places";
import { formatDate } from "@/lib/format";

type Linked = {
  placeId: string;
  rating: number | null;
  reviewCount: number | null;
  syncedAt: string | null;
};

function LinkButton({ placeId, name }: { placeId: string; name: string }) {
  const [state, formAction, pending] = useActionState<GoogleActionState, FormData>(
    linkGooglePlace,
    null
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="place_id" value={placeId} />
      <button
        type="submit"
        disabled={pending}
        className="btn-secondary !px-3 !py-1.5 text-xs"
      >
        {pending ? "Linking…" : `This is ${name.length > 20 ? "my business" : name}`}
      </button>
      {state?.error && <p className="alert-error mt-2">{state.error}</p>}
    </form>
  );
}

export function GoogleBusinessLinker({
  defaultQuery,
  linked,
}: {
  defaultQuery: string;
  linked: Linked | null;
}) {
  const [searchState, searchAction, searching] = useActionState<
    SearchState,
    FormData
  >(searchGooglePlaces, null);
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<GoogleActionState>(null);

  if (linked) {
    return (
      <div className="card-glass">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">Google Business Profile connected</p>
            {linked.rating !== null && (
              <p className="text-sm text-muted">
                ★ {linked.rating.toFixed(1)} on Google
                {linked.reviewCount !== null && ` (${linked.reviewCount} reviews)`}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-2">
              {linked.syncedAt
                ? `Last synced ${formatDate(linked.syncedAt)}`
                : "Not synced yet"}
            </p>
          </div>
        </div>

        {actionResult?.error && <p className="alert-error mt-3">{actionResult.error}</p>}
        {actionResult?.success && <p className="alert-success mt-3">Updated.</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => setActionResult(await syncGoogleReviews()))
            }
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            {isPending ? "Syncing…" : "Refresh from Google"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm("Unlink your Google Business Profile? Ratings and reviews will stop showing on your public page.")) {
                startTransition(async () => setActionResult(await unlinkGooglePlace()));
              }
            }}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            Unlink
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass">
      <p className="font-medium">Connect your Google Business Profile</p>
      <p className="mt-1 text-sm text-muted">
        Search for your business on Google. Once linked, your real rating and
        a few recent reviews will show on your public profile.
      </p>

      <form action={searchAction} className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="query"
          defaultValue={defaultQuery}
          placeholder="Business name, city"
          className="input-glass flex-1"
        />
        <button
          type="submit"
          disabled={searching}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {searchState?.error && <p className="alert-error mt-4">{searchState.error}</p>}

      {searchState?.candidates && (
        <ul className="mt-4 flex flex-col gap-2">
          {searchState.candidates.map((c) => (
            <li
              key={c.placeId}
              className="flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.address}
                  {c.rating !== null &&
                    ` · ★ ${c.rating.toFixed(1)} (${c.userRatingCount ?? 0})`}
                </p>
              </div>
              <LinkButton placeId={c.placeId} name={c.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
