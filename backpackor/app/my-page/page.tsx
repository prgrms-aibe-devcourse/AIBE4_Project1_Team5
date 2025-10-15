// app/my-page/page.tsx
"use client";

import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const { user } = useAuth();
  const { profile, profileUrl, updateProfile, deleteProfileImage } = useProfile(
    user?.id
  );
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 데이터가 로드되면 닉네임 설정
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  // 닉네임 저장
  const handleSaveProfile = async () => {
    if (displayName.trim().length < 2) {
      alert("닉네임은 최소 2글자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
      });
      alert("프로필이 업데이트되었습니다.");
      window.location.reload(); // 새로고침
    } catch (err) {
      alert("프로필 업데이트 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  // 프로필 사진 변경
  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 확인 (5MB 이상 불가)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        profile_image: file,
      });
      alert("프로필 사진이 변경되었습니다.");
      window.location.reload(); // 새로고침
    } catch (err) {
      alert("프로필 사진 변경 중 오류가 발생했습니다.");
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 프로필 사진 삭제
  const handleDeleteProfileImage = async () => {
    if (!confirm("프로필 사진을 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      await deleteProfileImage();
      alert("프로필 사진이 삭제되었습니다.");
      window.location.reload(); // 새로고침
    } catch (err) {
      alert("프로필 사진 삭제 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          마이페이지
        </h1>
      </header>

      <main className="space-y-12">
        {/* 프로필 섹션 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-6">
            <Image
              src={profileUrl}
              alt="프로필 이미지"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.display_name ?? "사용자"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                가입일:{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("ko-KR")
                  : "-"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                사진 변경
              </button>
              <button
                onClick={handleDeleteProfileImage}
                disabled={isLoading}
                className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>
        </section>

        {/* 개인정보 섹션 */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              개인 정보
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              정보를 업데이트하세요.
            </p>
          </div>

          <div className="space-y-6">
            {/* 닉네임 (수정 가능) */}
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                닉네임 (최소 2글자)
              </label>
              <input
                id="nickname"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm p-2.5 shadow-sm focus:ring-2 focus:ring-[#4154ff] focus:border-[#4154ff] outline-none"
              />
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                이메일
              </label>
              <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                {user?.email ?? "-"}
              </div>
              <p className="text-gray-400 text-xs mt-1">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* 변경사항 저장 버튼 */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-8">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? "저장 중..." : "변경사항 저장"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
