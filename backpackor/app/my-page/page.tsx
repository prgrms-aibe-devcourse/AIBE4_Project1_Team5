"use client";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProfileImageUploader } from "@/components/profile/ProfileImageUploader";
import { ProfileInfoSection as ProfileInfo } from "@/components/profile/ProfileInfoSection";
import { PersonalInfoSection } from "@/components/profile/PersonalInfoSection";
import { ActivitySection } from "@/components/profile/ActivitySection";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/auth/useProfile";
import { useProfileManager } from "@/hooks/auth/useProfileManager";
import { useActivityCounts } from "@/hooks/auth/useActivityCounts";

export default function MyPage() {
  const { user } = useAuth();
  const { profile, profileUrl } = useProfile(user?.id);
  const { isLoading, saveProfile, changeProfileImage, deleteImage } =
    useProfileManager(user?.id, profile?.profile_image ?? null);
  const { counts, isLoading: isLoadingCounts } = useActivityCounts(user?.id);

  // Early return: 사용자 정보 없음
  if (!user) {
    return <LoadingSpinner fullScreen message="사용자 정보를 불러오는 중..." />;
  }

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
          <div className="flex items-center justify-between">
            {/* 왼쪽: 프로필 이미지 + 정보 */}
            <div className="flex items-center space-x-6">
              <ProfileImageUploader
                imageUrl={profileUrl}
                displayName={profile?.display_name ?? null}
                isLoading={isLoading}
                onImageChange={changeProfileImage}
                onImageDelete={deleteImage}
                showButtons={false}
              />
              <ProfileInfo
                displayName={profile?.display_name ?? "사용자"}
                email={user.email ?? "-"}
                createdAt={user.created_at}
              />
            </div>

            {/* 오른쪽: 사진 변경/삭제 버튼 */}
            <ProfileImageUploader
              imageUrl={profileUrl}
              displayName={profile?.display_name ?? null}
              isLoading={isLoading}
              onImageChange={changeProfileImage}
              onImageDelete={deleteImage}
              showImageOnly={false}
              showButtons={true}
            />
          </div>
        </section>

        {/* 개인 정보 섹션 */}
        <PersonalInfoSection
          initialDisplayName={profile?.display_name ?? null}
          email={user.email ?? "-"}
          isLoading={isLoading}
          onSave={saveProfile}
        />

        {/* 지난 활동 섹션 */}
        <ActivitySection
          tripCount={counts.tripCount}
          favoriteCount={counts.favoriteCount}
          reviewCount={counts.reviewCount}
        />
      </main>
    </div>
  );
}
