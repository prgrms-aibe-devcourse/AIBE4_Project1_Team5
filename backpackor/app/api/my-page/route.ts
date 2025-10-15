import { createServerClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json(data || { user_id: user.id });
  } catch (error) {
    console.error("프로필 조회 실패:", error);
    return NextResponse.json(
      { error: "프로필 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 프로필 업데이트 (닉네임 또는 사진)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let updates: any = {};

    if (contentType.includes("application/json")) {
      // JSON 데이터 (닉네임 업데이트)
      const body = await request.json();

      if (body.display_name) {
        const trimmedName = body.display_name.trim();

        // 길이 검증
        if (trimmedName.length < 2) {
          return NextResponse.json(
            { error: "닉네임은 최소 2글자 이상이어야 합니다." },
            { status: 400 }
          );
        }

        if (trimmedName.length > 20) {
          return NextResponse.json(
            { error: "닉네임은 최대 20글자까지 가능합니다." },
            { status: 400 }
          );
        }

        // 특수문자 검증
        const nameRegex = /^[a-zA-Z0-9가-힣_]+$/;
        if (!nameRegex.test(trimmedName)) {
          return NextResponse.json(
            {
              error:
                "닉네임에는 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
            },
            { status: 400 }
          );
        }

        updates.display_name = trimmedName;
      }

      // user_profile 테이블 업데이트
      const { data, error } = await supabase
        .from("user_profile")
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    } else if (contentType.includes("multipart/form-data")) {
      // FormData (프로필 사진 업로드)
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "파일이 없습니다." },
          { status: 400 }
        );
      }

      // 파일 타입 검증
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "JPG, PNG, WEBP, GIF 형식의 이미지만 업로드 가능합니다." },
          { status: 400 }
        );
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "파일 크기는 5MB 이하여야 합니다." },
          { status: 400 }
        );
      }

      // 기존 파일 삭제
      const { data: existingProfile } = await supabase
        .from("user_profile")
        .select("profile_image")
        .eq("user_id", user.id)
        .single();

      if (existingProfile?.profile_image) {
        await supabase.storage.from("profile").remove([`${user.id}`]);
      }

      // 새 파일 업로드
      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("profile")
        .upload(`${user.id}`, buffer, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // 캐시 방지를 위한 타임스탬프 추가
      const timestamp = Date.now();
      const profileImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile/${user.id}?t=${timestamp}`;

      // user_profile 테이블 업데이트
      const { data, error } = await supabase
        .from("user_profile")
        .upsert({
          user_id: user.id,
          profile_image: profileImageUrl,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "지원하지 않는 요청 형식입니다." },
      { status: 400 }
    );
  } catch (error) {
    console.error("프로필 업데이트 실패:", error);
    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 프로필 사진 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // 현재 프로필 정보 조회
    const { data: existingProfile } = await supabase
      .from("user_profile")
      .select("profile_image")
      .eq("user_id", user.id)
      .single();

    // 기본 이미지를 사용 중이면 삭제할 필요 없음
    const defaultImageUrl =
      "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";
    if (
      !existingProfile?.profile_image ||
      existingProfile.profile_image === defaultImageUrl
    ) {
      return NextResponse.json(
        { error: "삭제할 프로필 사진이 없습니다." },
        { status: 400 }
      );
    }

    // Storage에서 사진 삭제
    const { error: deleteStorageError } = await supabase.storage
      .from("profile")
      .remove([`${user.id}`]);

    if (
      deleteStorageError &&
      deleteStorageError.message !== "The object does not exist"
    ) {
      throw deleteStorageError;
    }

    // user_profile 테이블에서 profile_image null로 업데이트
    const { data, error } = await supabase
      .from("user_profile")
      .update({ profile_image: null })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ message: "프로필 사진이 삭제되었습니다." });
  } catch (error) {
    console.error("프로필 사진 삭제 실패:", error);
    return NextResponse.json(
      { error: "프로필 사진 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
