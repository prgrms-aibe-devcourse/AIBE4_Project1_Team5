// 지도 로딩/에러 상태 컴포넌트
"use client";

interface MapLoadingStateProps {
  loaded: boolean;
  error: string | null;
}

export const MapLoadingState = ({ loaded, error }: MapLoadingStateProps) => {
  if (loaded && !error) {
    return null;
  }

  return (
    <>
      {!loaded && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span>지도를 불러오는 중...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}
    </>
  );
};
