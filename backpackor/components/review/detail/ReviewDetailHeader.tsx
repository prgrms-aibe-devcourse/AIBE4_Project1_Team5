// 리뷰 상세 페이지 헤더 컴포넌트
import { ReviewActionButtons } from "@/components/review/ReviewButton";
import { renderStars } from "@/utils/rating";
import { formatDate } from "@/utils/dateFormat";
import type { ReviewWithImages } from "@/types/review";
import type { PlaceInfo } from "@/types/place";

interface ReviewDetailHeaderProps {
  review: ReviewWithImages;
  placeInfo: PlaceInfo | null;
  authorProfile: { display_name: string | null } | null;
  authorProfileUrl: string | null;
  isProfileLoading: boolean;
  currentUserId: string | undefined;
  onPlaceClick: () => void;
  onDelete: () => void;
}

export const ReviewDetailHeader = ({
  review,
  placeInfo,
  authorProfile,
  authorProfileUrl,
  isProfileLoading,
  currentUserId,
  onPlaceClick,
  onDelete,
}: ReviewDetailHeaderProps) => {
  const isAuthor = currentUserId === review.user_id;

  return (
    <div className="p-8 border-b border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            {review.review_title}
          </h1>

          {/* 여행지 카드 */}
          {placeInfo && (
            <div
              role="button"
              tabIndex={0}
              onClick={onPlaceClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onPlaceClick();
              }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="flex items-center gap-4">
                {placeInfo.place_image && (
                  <img
                    src={placeInfo.place_image}
                    alt={placeInfo.place_name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-900 truncate">
                      {placeInfo.place_name}
                    </h3>
                  </div>
                  {placeInfo.place_address && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {placeInfo.place_address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 별점 */}
          <div className="flex items-center gap-3">
            <div className="flex">{renderStars(review.rating)}</div>
            <span className="text-xl font-semibold text-gray-800">
              {review.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 수정/삭제 버튼 */}
        {isAuthor && (
          <ReviewActionButtons reviewId={review.review_id} onDelete={onDelete} />
        )}
      </div>

      {/* 작성 정보 */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {isProfileLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <img
              src={
                authorProfileUrl && authorProfileUrl.trim() !== ""
                  ? authorProfileUrl
                  : "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png"
              }
              alt={authorProfile?.display_name || "프로필"}
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-gray-100"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";
              }}
            />
          )}
          <span className="font-semibold text-gray-700">
            {authorProfile?.display_name || "익명 사용자"}
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formatDate(review.created_at)}</span>
        </div>
        {review.updated_at && review.updated_at !== review.created_at && (
          <>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2 text-orange-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>수정됨: {formatDate(review.updated_at)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};