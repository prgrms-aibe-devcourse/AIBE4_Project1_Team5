import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import { PlaceCache } from "@/lib/placeCache";
import { HomeCache } from "@/lib/homeCache";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { userId, placeId } = await req.json();

  if (!userId || !placeId) {
    return NextResponse.json(
      { error: "Missing userId or placeId" },
      { status: 400 }
    );
  }

  try {
    // 1) user_favorite_place에 추가
    const { error: insertError } = await supabase
      .from("user_favorite_place")
      .insert([{ user_id: userId, place_id: placeId }]);

    if (insertError) throw insertError;

    // 2) place 테이블에서 현재 favorite_count 가져오기
    const { data: placeData, error: selectError } = await supabase
      .from("place")
      .select("favorite_count")
      .eq("place_id", placeId)
      .single();

    if (selectError) throw selectError;

    // 3) favorite_count +1
    const { error: updateError } = await supabase
      .from("place")
      .update({ favorite_count: (placeData?.favorite_count || 0) + 1 })
      .eq("place_id", placeId);

    if (updateError) throw updateError;

    // 찜 추가 시 여행지 캐시 무효화 (찜 개수 변경됨)
    console.log("[찜 추가] 캐시 무효화 시작");
    PlaceCache.clearAllCache();
    HomeCache.clear(); // 메인페이지 캐시도 무효화

    // TOP 3 Materialized View 갱신
    console.log("[찜 추가] TOP 3 갱신 시작");
    await supabase.rpc('refresh_top_places');

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("POST /api/favorite error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { userId, placeId } = await req.json();

  if (!userId || !placeId) {
    return NextResponse.json(
      { error: "Missing userId or placeId" },
      { status: 400 }
    );
  }

  try {
    // 1) user_favorite_place에서 삭제
    const { error: deleteError } = await supabase
      .from("user_favorite_place")
      .delete()
      .eq("user_id", userId)
      .eq("place_id", placeId);

    if (deleteError) throw deleteError;

    // 2) place 테이블에서 현재 favorite_count 가져오기
    const { data: placeData, error: selectError } = await supabase
      .from("place")
      .select("favorite_count")
      .eq("place_id", placeId)
      .single();

    if (selectError) throw selectError;

    // 3) favorite_count -1 (0 이하로는 내려가지 않도록)
    const newCount = Math.max((placeData?.favorite_count || 0) - 1, 0);
    const { error: updateError } = await supabase
      .from("place")
      .update({ favorite_count: newCount })
      .eq("place_id", placeId);

    if (updateError) throw updateError;

    // 찜 삭제 시 여행지 캐시 무효화 (찜 개수 변경됨)
    console.log("[찜 삭제] 캐시 무효화 시작");
    PlaceCache.clearAllCache();
    HomeCache.clear(); // 메인페이지 캐시도 무효화

    // TOP 3 Materialized View 갱신
    console.log("[찜 삭제] TOP 3 갱신 시작");
    await supabase.rpc('refresh_top_places');

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("DELETE /api/favorite error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET 메서드 추가 - 찜 여부 확인용
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const placeId = searchParams.get("placeId");

  if (!userId || !placeId) {
    return NextResponse.json(
      { error: "Missing userId or placeId" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("user_favorite_place")
      .select("*")
      .eq("user_id", userId)
      .eq("place_id", placeId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ isFavorite: !!data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("GET /api/favorite error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
