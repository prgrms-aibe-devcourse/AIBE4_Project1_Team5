// app/apis/review/helpful/route.ts
import { createServerClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { reviewId, action } = await request.json();

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "reviewId와 action이 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 helpful_count 조회
    const { data: currentReview, error: fetchError } = await supabase
      .from("review")
      .select("helpful_count")
      .eq("review_id", reviewId)
      .single();

    if (fetchError || !currentReview) {
      console.error("리뷰 조회 실패:", fetchError);
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // helpful_count 계산
    let newHelpfulCount = currentReview.helpful_count || 0;

    if (action === "add") {
      newHelpfulCount = newHelpfulCount + 1;
    } else if (action === "remove") {
      newHelpfulCount = Math.max(0, newHelpfulCount - 1);
    }

    // helpful_count 업데이트
    const { data, error: updateError } = await supabase
      .from("review")
      .update({ helpful_count: newHelpfulCount })
      .eq("review_id", reviewId)
      .select("helpful_count")
      .single();

    if (updateError) {
      console.error("도움됨 업데이트 실패:", updateError);
      return NextResponse.json(
        { error: "도움됨 처리에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      helpful_count: data.helpful_count,
    });
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
