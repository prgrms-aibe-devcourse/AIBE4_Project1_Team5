"use client";

import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/place", label: "여행지" },
  { href: "/planner", label: "일정 계획" },
  { href: "/my-planner", label: "내 일정" },
  { href: "/review", label: "리뷰" },
] as const;

export default function Navbar() {
  const { user } = useAuth();
  const { profile, profileUrl } = useProfile(user?.id);

  return (
    <nav className="flex items-center bg-white py-2 px-6 border-b border-gray-200">
      {/* 로고 */}
      <Link
        href="/"
        className="flex items-center transition-transform duration-300 hover:scale-105"
      >
        <Image
          src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/brand/red.png"
          alt="BackpacKOR 로고"
          width={200}
          height={56}
          priority
          className="w-[200px] h-auto object-contain"
        />
      </Link>

      {/* 메뉴 - 중앙 정렬 */}
      <ul className="flex flex-1 justify-center">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href} className="py-2 px-4">
            <Link
              href={href}
              className="text-gray-800 hover:text-blue-500 hover:font-bold transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 우측: 로그인/프로필 */}
      <div className="flex items-center gap-3">
        {user ? (
          <Link
            href="/my-page"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-9 h-9">
              <Image
                src={profileUrl}
                alt="프로필 이미지"
                fill
                sizes="36px"
                className="rounded-full object-cover ring-1 ring-gray-200"
              />
            </div>
            <span className="text-sm text-gray-800">
              {profile?.display_name || "사용자"}님
            </span>
          </Link>
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
