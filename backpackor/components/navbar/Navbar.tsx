"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/auth/useProfile";
import { useSocialLogin } from "@/hooks/auth/useSocialLogin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "홈" },
  { href: "/place", label: "여행지" },
  { href: "/planner", label: "일정 계획" },
  { href: "/my-planner", label: "내 일정" },
  { href: "/review", label: "리뷰" },
] as const;

const DEFAULT_PROFILE_IMAGE = "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { profile, profileUrl } = useProfile(user?.id);
  const { handleLogout } = useSocialLogin();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center bg-white py-2 px-6 border-b border-gray-200 relative">
      {/* 로고 */}
      <button
        onClick={() => {
          // 여행지 필터 초기화
          sessionStorage.setItem("place_list_page", "1");
          sessionStorage.removeItem("place_filter_search_keyword");
          sessionStorage.removeItem("place_filter_sort");
          sessionStorage.removeItem("place_filter_region_id");
          sessionStorage.removeItem("place_filter_favorite");
          // 리뷰 필터 초기화
          sessionStorage.setItem("review_list_page", "1");
          sessionStorage.removeItem("review_filter_sort");
          sessionStorage.removeItem("review_filter_region_id");
          sessionStorage.removeItem("review_filter_my_reviews");
          router.push("/");
        }}
        className="flex items-center transition-transform duration-300 hover:scale-105"
      >
        <div className="relative w-[200px] h-[56px]">
          <img
            src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/brand/red.png"
            alt="로고"
            className="object-contain w-full h-full"
          />
        </div>
      </button>

      {/* 메뉴 */}
      <ul className="flex flex-1 justify-center">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href} className="py-2 px-4">
            {href === "/place" ? (
              // "여행지" 링크는 특별 처리: 항상 page=1로 시작, 필터/정렬 초기화
              <button
                onClick={(e) => {
                  e.preventDefault();
                  sessionStorage.setItem("place_list_page", "1");
                  sessionStorage.removeItem("place_filter_search_keyword");
                  sessionStorage.removeItem("place_filter_sort");
                  sessionStorage.removeItem("place_filter_region_id");
                  sessionStorage.removeItem("place_filter_favorite");
                  // 리뷰 필터 초기화
                  sessionStorage.setItem("review_list_page", "1");
                  sessionStorage.removeItem("review_filter_sort");
                  sessionStorage.removeItem("review_filter_region_id");
                  sessionStorage.removeItem("review_filter_my_reviews");
                  router.push("/place?page=1");
                }}
                className="font-bold text-gray-800 hover:text-blue-500 hover:font-bold transition-colors cursor-pointer"
              >
                {label}
              </button>
            ) : (
              <Link
                href={href}
                className="font-bold text-gray-800 hover:text-blue-500 hover:font-bold transition-colors"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* 우측: 로그인 / 프로필 */}
      <div className="flex items-center gap-3 relative" ref={menuRef}>
        {loading ? (
          // 로딩 중 스켈레톤 UI
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-20 h-5 rounded bg-gray-200 animate-pulse" />
          </div>
        ) : user ? (
          <>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={profileUrl || DEFAULT_PROFILE_IMAGE}
                alt="프로필 이미지"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
              />
              <span className="text-sm text-gray-800">
                {profile?.display_name || "사용자"}님
              </span>
            </button>

            {/* ▼ 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div className="absolute top-12 right-0 z-50 bg-gray-50 border border-gray-200 rounded-md shadow-md w-28 text-sm">
                <button
                  onClick={() => {
                    // 여행지 필터 초기화
                    sessionStorage.setItem("place_list_page", "1");
                    sessionStorage.removeItem("place_filter_search_keyword");
                    sessionStorage.removeItem("place_filter_sort");
                    sessionStorage.removeItem("place_filter_region_id");
                    sessionStorage.removeItem("place_filter_favorite");
                    // 리뷰 필터 초기화
                    sessionStorage.setItem("review_list_page", "1");
                    sessionStorage.removeItem("review_filter_sort");
                    sessionStorage.removeItem("review_filter_region_id");
                    sessionStorage.removeItem("review_filter_my_reviews");
                    setIsMenuOpen(false);
                    router.push("/my-page");
                  }}
                  className="block w-full px-4 py-2 text-gray-800 hover:bg-gray-100 text-center"
                >
                  마이페이지
                </button>
                <button
                  onClick={() => {
                    // 여행지 필터 초기화
                    sessionStorage.setItem("place_list_page", "1");
                    sessionStorage.removeItem("place_filter_search_keyword");
                    sessionStorage.removeItem("place_filter_sort");
                    sessionStorage.removeItem("place_filter_region_id");
                    sessionStorage.removeItem("place_filter_favorite");
                    // 리뷰 필터 초기화
                    sessionStorage.setItem("review_list_page", "1");
                    sessionStorage.removeItem("review_filter_sort");
                    sessionStorage.removeItem("review_filter_region_id");
                    sessionStorage.removeItem("review_filter_my_reviews");
                    handleLogout();
                  }}
                  className="block w-full px-4 py-2 text-gray-800 hover:bg-gray-100 text-center"
                >
                  로그아웃
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="bg-white text-[#4154ff] border border-[#4154ff] font-semibold py-2 px-[18px] rounded-lg transition-all duration-300 ease-in-out hover:bg-[#4154ff] hover:text-white"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
