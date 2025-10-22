// 리뷰 액션 바 (목록/수정 버튼)

interface ReviewActionBarProps {
  reviewId: string;
  isAuthor: boolean;
  onListClick: () => void;
  onEditClick: () => void;
}

export const ReviewActionBar = ({
  reviewId,
  isAuthor,
  onListClick,
  onEditClick,
}: ReviewActionBarProps) => {
  return (
    <div className="p-8 bg-gray-50 border-t border-gray-100">
      <div className="flex gap-3">
        <button
          onClick={onListClick}
          className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          전체 리뷰보기
        </button>
        {isAuthor && (
          <button
            onClick={onEditClick}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            수정하기
          </button>
        )}
      </div>
    </div>
  );
};