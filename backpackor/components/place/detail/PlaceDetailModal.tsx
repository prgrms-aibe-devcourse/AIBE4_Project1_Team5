// 여행지 상세 모달 컴포넌트
"use client";

import PlaceDetailContent from "@/components/place/detail/PlaceDetailContent";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { PlaceDetail } from "@/types/place";
import { useEffect, useState } from "react";

interface PlaceDetailModalProps {
  placeId: string;
  onClose: () => void;
  showReviewButton?: boolean;
}

export default function PlaceDetailModal({
  placeId,
  onClose,
  showReviewButton = false,
}: PlaceDetailModalProps) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [initialIsFavorite, setInitialIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchPlaceData = async () => {
      setLoading(true);

      // place 데이터 조회
      const { data: placeData, error: placeError } = await supabase
        .from("place")
        .select("*")
        .eq("place_id", placeId)
        .single();

      if (placeError || !placeData) {
        console.error("Failed to fetch place data:", placeError);
        setLoading(false);
        return;
      }

      setPlace(placeData as PlaceDetail);

      // 사용자 찜 상태 조회
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: favData } = await supabase
          .from("user_favorite_place")
          .select("place_id")
          .eq("user_id", user.id)
          .eq("place_id", placeId)
          .maybeSingle();

        setInitialIsFavorite(!!favData);
      }

      setLoading(false);
    };

    fetchPlaceData();
  }, [placeId, supabase]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // 로딩 중
  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 overflow-y-auto md:p-0 md:items-start"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[900px] max-h-[90vh] bg-white rounded-2xl overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-modalSlideIn md:max-w-full md:max-h-screen md:rounded-none md:h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center justify-center py-20 px-5 text-gray-600">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!place) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-5 overflow-y-auto md:p-0 md:items-start"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] max-h-[90vh] bg-white rounded-2xl overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-modalSlideIn md:max-w-full md:max-h-screen md:rounded-none md:h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 w-11 h-11 bg-white/95 border-0 rounded-full text-2xl cursor-pointer flex items-center justify-center z-[1001] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 text-gray-800 hover:bg-white hover:scale-110 active:scale-100 md:w-10 md:h-10 md:text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 모달 컨텐츠 */}
        <div className="p-0">
          <PlaceDetailContent
            place={place}
            initialIsFavorite={initialIsFavorite}
            showReviewButton={showReviewButton}
            reviewCount={0}
            averageRating={0}
          />
        </div>
      </div>

      {/* 애니메이션 키프레임 정의 */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
