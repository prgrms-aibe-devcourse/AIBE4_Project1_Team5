// 개인 정보 섹션 컴포넌트
"use client";

import { ProfileEditForm } from "./ProfileEditForm";

interface PersonalInfoSectionProps {
  initialDisplayName: string | null;
  email: string;
  isLoading: boolean;
  onSave: (displayName: string) => void;
}

export const PersonalInfoSection = ({
  initialDisplayName,
  email,
  isLoading,
  onSave,
}: PersonalInfoSectionProps) => {
  return (
    <section className="pt-10 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="md:w-1/3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            개인 정보
          </h3>
          <p className="text-sm text-gray-500 mt-1">정보를 업데이트하세요.</p>
        </div>
        <div className="md:w-2/3">
          <ProfileEditForm
            initialDisplayName={initialDisplayName}
            email={email}
            isLoading={isLoading}
            onSave={onSave}
          />
        </div>
      </div>
    </section>
  );
};
