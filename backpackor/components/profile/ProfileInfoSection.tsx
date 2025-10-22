// 프로필 정보 섹션 컴포넌트

interface ProfileInfoSectionProps {
  displayName: string;
  email: string;
  createdAt: string;
}

export const ProfileInfoSection = ({
  displayName,
  email,
  createdAt,
}: ProfileInfoSectionProps) => {
  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {displayName || "사용자"}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {email}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        가입일: {new Date(createdAt).toLocaleDateString("ko-KR")}
      </p>
    </div>
  );
};
