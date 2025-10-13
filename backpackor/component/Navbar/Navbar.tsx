import Image from "next/image";
import Link from "next/link";
import React from "react";

// Navbar 컴포넌트에 props가 없으므로 React.FC (Functional Component) 타입을 지정합니다.
const Navbar: React.FC = () => {
  return (
    // Navbar.module.css의 스타일을 Tailwind CSS 유틸리티 클래스로 변환하여 적용합니다.
    <nav className="flex justify-between items-center bg-white py-2 px-6 border-b border-gray-200">
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

      {/* 메뉴 */}
      <ul className="flex">
        <li className="py-2 px-4">
          <Link
            href="/"
            className="text-gray-800 hover:text-blue-500 hover:font-bold"
          >
            홈
          </Link>
        </li>
        <li className="py-2 px-4">
          <Link
            href="/place"
            className="text-gray-800 hover:text-blue-500 hover:font-bold"
          >
            여행지
          </Link>
        </li>
        <li className="py-2 px-4">
          <Link
            href="/planner"
            className="text-gray-800 hover:text-blue-500 hover:font-bold"
          >
            일정 만들기
          </Link>
        </li>
        <li className="py-2 px-4">
          {/* 현재 페이지가 없으므로 #으로 유지합니다. */}
          <Link
            href="#"
            className="text-gray-800 hover:text-blue-500 hover:font-bold"
          >
            내 일정
          </Link>
        </li>
        <li className="py-2 px-4">
          <Link
            href="/review"
            className="text-gray-800 hover:text-blue-500 hover:font-bold"
          >
            리뷰
          </Link>
        </li>
      </ul>

      {/* 로그인 버튼 */}
      <div>
        <Link
          href="/login"
          className="bg-white text-[#4154ff] border border-[#4154ff] font-semibold py-2 px-[18px] rounded-lg transition-all duration-300 ease-in-out hover:bg-[#4154ff] hover:text-white"
        >
          로그인
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
