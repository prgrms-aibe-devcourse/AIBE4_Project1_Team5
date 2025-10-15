"use client";

import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import Image from "next/image";

export default function Page() {
  const { user } = useAuth();
  const { profile, profileUrl } = useProfile(user?.id);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen">
      {/* 헤더 */}
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
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              사진 변경
            </button>
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
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={profile?.display_name ?? ""}
                onChange={() => {}} // 추후 수정 로직 연결
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
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                {user?.email ?? "-"}
              </div>
            </div>

            {/* 변경사항 저장 버튼 */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-8">
              <button className="btn-primary">변경사항 저장</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
