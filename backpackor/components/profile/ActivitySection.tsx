// 지난 활동 섹션 컴포넌트
"use client";

import { Bookmark, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface ActivitySectionProps {
  tripCount: number;
  favoriteCount: number;
  reviewCount: number;
}

export const ActivitySection = ({
  tripCount,
  favoriteCount,
  reviewCount,
}: ActivitySectionProps) => {
  return (
    <section className="pt-10 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="md:w-1/3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            지난 활동
          </h3>
          <p className="text-sm text-gray-500 mt-1">기록을 검토하세요.</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          {/* 내 일정 */}
          <Link
            href="/my-planner"
            className="flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 dark:text-white">
                  내 일정
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {tripCount > 0
                    ? `${tripCount}개의 일정`
                    : "여행 계획 확인"}
                </span>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </Link>

          {/* 찜한 장소 */}
          <Link
            href="/my-page/favorites"
            className="flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Bookmark className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 dark:text-white">
                  찜한 장소
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {favoriteCount > 0
                    ? `${favoriteCount}개의 찜한 장소`
                    : "저장한 여행지 목록"}
                </span>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </Link>

          {/* 내 리뷰 */}
          <Link
            href="/my-page/reviews"
            className="flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <span className="block font-medium text-gray-900 dark:text-white">
                  내 리뷰
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {reviewCount > 0
                    ? `${reviewCount}개의 리뷰`
                    : "남긴 후기를 확인"}
                </span>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
