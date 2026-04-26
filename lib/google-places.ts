// Client-side Google Places types + helpers.

export type GooglePlaceSummary = {
  place_id: string;
  name: string;
  vicinity?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
  business_status?: string;
  opening_hours?: { open_now?: boolean };
  photos?: { photo_reference: string }[];
  price_level?: number;
};

export type GooglePlaceDetails = GooglePlaceSummary & {
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  url?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  current_opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
};

export async function fetchNearbyPlace(
  lat: number,
  lng: number,
): Promise<GooglePlaceSummary | null> {
  try {
    const res = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { place: GooglePlaceSummary | null };
    return data.place;
  } catch {
    return null;
  }
}

export async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  try {
    const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { place: GooglePlaceDetails };
    return data.place;
  } catch {
    return null;
  }
}

// Build a Google Places Photo URL using their Photo API.
// Note: requires the Google Places API key to be allowed for HTTP referer "*"
// or your domain. Photos render via <img src=...>.
export function googlePhotoUrl(photoReference: string, maxWidth = 400): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_BROWSER_KEY ?? "";
  if (!key) return "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${key}`;
}

// Format types like "cafe", "point_of_interest" → "Cafe · Point of Interest"
export function formatTypes(types?: string[]): string {
  if (!types || types.length === 0) return "";
  return types
    .filter((t) => !["establishment", "point_of_interest"].includes(t))
    .slice(0, 2)
    .map((t) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" · ");
}
