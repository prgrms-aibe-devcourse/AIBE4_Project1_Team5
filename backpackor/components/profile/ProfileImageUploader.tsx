// 프로필 이미지 업로더 컴포넌트
import { useRef } from "react";

interface ProfileImageUploaderProps {
  imageUrl: string | null;
  displayName: string | null;
  isLoading: boolean;
  onImageChange: (file: File) => void;
  onImageDelete: () => void;
  showButtons?: boolean;
  showImageOnly?: boolean;
}

export const ProfileImageUploader = ({
  imageUrl,
  displayName,
  isLoading,
  onImageChange,
  onImageDelete,
  showButtons = true,
  showImageOnly = true,
}: ProfileImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const DEFAULT_IMAGE = "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";

  // 버튼만 렌더링
  if (showButtons && !showImageOnly) {
    return (
      <>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            사진 변경
          </button>
          <button
            onClick={onImageDelete}
            disabled={isLoading}
            className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 transition-colors"
          >
            삭제
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </>
    );
  }

  // 이미지만 렌더링
  if (!showButtons && showImageOnly) {
    return (
      <img
        src={imageUrl || DEFAULT_IMAGE}
        alt="프로필 이미지"
        className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
      />
    );
  }

  // 기본: 이미지 + 버튼 모두 렌더링 (기존 레이아웃)
  return (
    <div className="flex items-center space-x-6">
      <img
        src={imageUrl || DEFAULT_IMAGE}
        alt="프로필 이미지"
        className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
      />
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          사진 변경
        </button>
        <button
          onClick={onImageDelete}
          disabled={isLoading}
          className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 transition-colors"
        >
          삭제
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
