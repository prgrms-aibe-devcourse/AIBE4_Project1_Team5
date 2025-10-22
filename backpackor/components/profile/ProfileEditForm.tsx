// 프로필 수정 폼 컴포넌트
import { useEffect, useState } from "react";

interface ProfileEditFormProps {
  initialDisplayName: string | null;
  email: string;
  isLoading: boolean;
  onSave: (displayName: string) => void;
}

export const ProfileEditForm = ({
  initialDisplayName,
  email,
  isLoading,
  onSave,
}: ProfileEditFormProps) => {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (initialDisplayName) {
      setDisplayName(initialDisplayName);
    }
  }, [initialDisplayName]);

  const handleSubmit = () => {
    if (displayName.trim().length < 2) {
      alert("닉네임은 최소 2글자 이상이어야 합니다.");
      return;
    }
    onSave(displayName.trim());
  };

  return (
    <div className="space-y-6">
      {/* 닉네임 */}
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
        <div className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
          {email}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "저장 중..." : "변경사항 저장"}
        </button>
      </div>
    </div>
  );
};
