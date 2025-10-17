// app/api/reviews/route.ts
import { createServerClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");

    if (!placeId) {
      return NextResponse.json(
        { error: "place_id가 필요합니다." },
        { status: 400 }
      );
    }

    // 리뷰 데이터 조회
    const { data: reviews, error: reviewsError } = await supabase
      .from("review")
      .select("*")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("리뷰 조회 오류:", reviewsError);
      return NextResponse.json(
        { error: "리뷰를 불러오는데 실패했습니다.", details: reviewsError },
        { status: 500 }
      );
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        reviews: [],
        count: 0,
        averageRating: 0,
      });
    }

    // 리뷰의 user_id 목록 추출
    const userIds = [...new Set(reviews.map((r) => r.user_id))];

    // user_profile 테이블에서 사용자 정보 조회
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profile")
      .select("user_id, display_name")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("프로필 조회 오류:", profilesError);
    }

    // 리뷰와 프로필 매핑
    const reviewsWithProfiles = reviews.map((review) => {
      const profile = profiles?.find((p) => p.user_id === review.user_id);
      return {
        ...review,
        profiles: profile ? { display_name: profile.display_name } : null,
      };
    });

    // 통계 계산
    const count = reviews.length;
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return NextResponse.json({
      reviews: reviewsWithProfiles,
      count,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
