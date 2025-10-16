// /lib/services/fetchPlacesService.ts
import { createBrowserClient } from "@/lib/supabaseClient";
import type { Place, Plan } from "@/type/place";

const toPlace = (row: any): Place => ({
  place_id: row?.place_id ?? "",
  place_name: row?.place_name ?? "",
  place_image: row?.place_image ?? "",
  average_rating: row?.average_rating ?? null,
  favorite_count: row?.favorite_count ?? null,
  review_count: row?.review_count ?? null, // 스키마에 없다면 항상 null
  latitude: row?.latitude ?? null,
  longitude: row?.longitude ?? null,
  place_address: row?.place_address ?? null,
  place_description: row?.place_description ?? null,
  place_detail_image: row?.place_detail_image ?? null,
  region_id: row?.region_id ?? null,
  place_category: row?.place_category ?? null,
  visit_order: row?.visit_order ?? undefined,
  day_number: row?.day_number ?? undefined,
});

export async function fetchPlacesWithCoordinates(
  placeIds?: string[]
): Promise<Place[]> {
  const supabase = createBrowserClient();

  let query = supabase.from("place").select(`
    place_id,
    place_name,
    place_image,
    average_rating,
    favorite_count,
    latitude,
    longitude,
    place_address,
    place_description,
    place_detail_image,
    region_id,
    place_category
  `);

  if (placeIds?.length) query = query.in("place_id", placeIds);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toPlace);
}

export async function enrichPlanWithCoordinates(plan: Plan): Promise<Plan> {
  const ids = Array.from(
    new Set(
      Object.values(plan)
        .flat()
        .map((p) => p.place_id)
        .filter(Boolean)
    )
  );
  if (!ids.length) return plan;

  const fromDB = await fetchPlacesWithCoordinates(ids);
  const map = new Map(fromDB.map((p) => [p.place_id, p]));

  const enriched: Plan = {};
  Object.keys(plan).forEach((k) => {
    const day = parseInt(k, 10);
    enriched[day] = (plan[day] || []).map((p) => {
      const db = map.get(p.place_id);
      if (!db) return { ...p, place_image: p.place_image ?? "" };
      return {
        ...p,
        place_name: db.place_name,
        place_image: db.place_image ?? "",
        average_rating: db.average_rating ?? null,
        favorite_count: db.favorite_count ?? null,
        review_count: db.review_count ?? null,
        latitude: db.latitude ?? null,
        longitude: db.longitude ?? null,
        place_address: db.place_address ?? null,
        place_description: db.place_description ?? null,
        place_detail_image: db.place_detail_image ?? null,
        region_id: db.region_id ?? null,
        place_category: db.place_category ?? null,
      };
    });
  });
  return enriched;
}

export async function fetchTripPlanWithCoordinates(
  tripId: string
): Promise<Plan> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("trip_plan_detail")
    .select(
      `
      day_number,
      visit_order,
      place:place_id (
        place_id,
        place_name,
        place_image,
        average_rating,
        favorite_count,
        latitude,
        longitude,
        place_address,
        place_description,
        place_detail_image,
        region_id,
        place_category
      )
    `
    )
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true })
    .order("visit_order", { ascending: true });

  if (error) throw error;

  const plan: Plan = {};
  (data ?? []).forEach((row: any) => {
    if (!plan[row.day_number]) plan[row.day_number] = [];
    const normalized = toPlace(row.place);
    plan[row.day_number].push({
      ...normalized,
      visit_order: row.visit_order,
      day_number: row.day_number,
    });
  });

  return plan;
}
