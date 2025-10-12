// app/api/places/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "30");
  const offset = Number(searchParams.get("offset") ?? "0");

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("place")
    .select("place_id, place_name, place_image, average_rating")
    .order("average_rating", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("GET /api/places error:", error);
    return NextResponse.json(
      { data: [], error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
