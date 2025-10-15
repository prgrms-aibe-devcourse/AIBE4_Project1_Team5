import { createServerClient } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const BUCKET = process.env.NEXT_PUBLIC_PROFILE_BUCKET ?? "logo";
const FOLDER = "profile";
export const runtime = "nodejs"; // Node API 사용

const extFromType = (t?: string) => t?.split("/").pop() || "png";

export async function PUT(req: Request) {
  try {
    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let display_name: string | undefined;
    let profile_image_url: string | undefined;

    // 1) multipart/form-data (파일 업로드)
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData();
      const dn = form.get("display_name");
      if (typeof dn === "string") display_name = dn;

      const file = form.get("file") as File | null;
      if (file && file.size > 0) {
        const ext = extFromType(file.type);
        const objectPath = `${FOLDER}/${user.id}.${ext}`;

        // 다른 확장자 잔여물 정리 (jpg/png/webp 등)
        const candidates = ["png", "jpg", "jpeg", "webp", "gif"]
          .filter((e) => e !== ext)
          .map((e) => `${FOLDER}/${user.id}.${e}`);
        if (candidates.length) {
          await supabase.storage.from(BUCKET).remove(candidates);
        }

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(objectPath, file, { contentType: file.type, upsert: true });

        if (uploadErr) {
          return NextResponse.json(
            {
              success: false,
              message: "이미지 업로드 실패",
              detail: uploadErr.message,
            },
            { status: 500 }
          );
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        profile_image_url = data.publicUrl;
      }
    } else {
      // 2) application/json (닉네임/이미지 URL 직접 갱신)
      const body = await req.json().catch(() => ({}));
      if (typeof body.display_name === "string")
        display_name = body.display_name;
      if (typeof body.profile_image === "string")
        profile_image_url = body.profile_image;
    }

    // 닉네임 검증 (옵션 필드이지만 주어지면 2자 이상)
    if (typeof display_name === "string" && display_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "닉네임은 최소 2글자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (typeof display_name === "string")
      updateData.display_name = display_name.trim();
    if (typeof profile_image_url === "string")
      updateData.profile_image = profile_image_url;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "수정할 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("user_profile")
      .update(updateData)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, message: "업데이트 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "프로필이 수정되었습니다.",
      display_name: updateData.display_name,
      profile_image: updateData.profile_image,
    });
  } catch (error) {
    console.error("PUT /api/my-page 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 현재 저장된 이미지 URL 조회
    const { data: row, error: selErr } = await supabase
      .from("user_profile")
      .select("profile_image")
      .eq("user_id", user.id)
      .single();

    if (selErr) {
      return NextResponse.json(
        { success: false, message: "프로필 조회 실패" },
        { status: 500 }
      );
    }

    // DB에서 null로 갱신
    const { error: updErr } = await supabase
      .from("user_profile")
      .update({ profile_image: null })
      .eq("user_id", user.id);

    if (updErr) {
      return NextResponse.json(
        { success: false, message: "DB 업데이트 실패" },
        { status: 500 }
      );
    }

    // 스토리지에서 실제 파일 제거 (기본 이미지/타 유저 파일은 보호)
    if (row?.profile_image) {
      try {
        const url = new URL(row.profile_image);
        // /storage/v1/object/public/<bucket>/<path...>
        const parts = url.pathname.split("/").filter(Boolean);
        const publicIdx = parts.findIndex((p) => p === "public");
        const bucket = publicIdx >= 0 ? parts[publicIdx + 1] : BUCKET;
        const pathInBucket = parts.slice(publicIdx + 2).join("/"); // e.g. profile/uuid.png
        const fileName = pathInBucket.split("/").pop() || "";

        // 우리 규칙: profile/<user.id>.* 만 삭제
        if (
          pathInBucket.startsWith(`${FOLDER}/`) &&
          fileName.startsWith(user.id)
        ) {
          await supabase.storage.from(bucket).remove([pathInBucket]);
        }
      } catch {
        // URL 파싱 실패 시 조용히 무시 (DB는 이미 null)
      }
    }

    return NextResponse.json({
      success: true,
      message: "프로필 이미지가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("DELETE /api/my-page 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
