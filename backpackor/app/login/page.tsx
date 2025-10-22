// app/login/page.tsx
import { Suspense } from "react";
import LoginClientUI from "./LoginClientUI";

function LoginPageLoading() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 mt-[-2rem]">
      <div className="w-full max-w-md py-20 px-12 space-y-20 bg-white rounded-3xl shadow-xl">
        {/* 제목 영역 */}
        <div className="text-center space-y-5">
          <h1 className="text-4xl font-bold text-gray-900">로그인</h1>
          <p className="text-lg text-gray-600">
            소셜 계정으로 간편하게 시작해보세요
          </p>
          <div className="w-40 mx-auto border-t-2 border-gray-200 opacity-70 mt-6" />
        </div>

        {/* 로딩 상태 표시 */}
        <div className="flex justify-center items-center space-x-10 h-16">
          <p className="text-gray-500">로그인 버튼 로딩 중...</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginClientUI />
    </Suspense>
  );
}
