import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/favorite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/favorite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    console.error("GET /api/favorite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
