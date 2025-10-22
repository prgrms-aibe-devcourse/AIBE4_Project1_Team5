// @/component/place/RelatedPlacesSection.tsx

"use client";

import { PlaceCard } from "@/components/place/card/PlaceCard";
import { supabase } from "@/lib/supabaseClient";
import type { PlaceSummary } from "@/types/place";
import React, { useEffect, useState } from "react";

// 한 페이지에 보여줄 카드 개수를 3으로 설정
const CARDS_PER_PAGE = 3;

interface RelatedPlacesSectionProps {
  currentPlaceId: string;
  regionId: number;
}

const fetchInitialPlaces = async (
  regionId: number,
  excludePlaceId: string
): Promise<PlaceSummary[]> => {
  // 1단계: 평점 4 이상인 장소 최대 CARDS_PER_PAGE(3)개 조회
  const { data: highRatedData } = await supabase
    .from("place")
    .select("*")
    .eq("region_id", regionId)
    .gte("average_rating", 4)
    .neq("place_id", excludePlaceId)
    .order("average_rating", { ascending: false })
    .limit(CARDS_PER_PAGE);

  if (highRatedData && highRatedData.length >= CARDS_PER_PAGE) {
    return highRatedData;
  }

  // 2단계: 부족하면 랜덤으로 채우기
  const excludeIds = [
    excludePlaceId,
    ...(highRatedData || []).map((p) => p.place_id),
  ];
  // 넉넉하게 20개 조회 후 클라이언트에서 랜덤 셔플
  const { data: randomData } = await supabase
    .from("place")
    .select("*")
    .eq("region_id", regionId)
    .not("place_id", "in", `(${excludeIds.join(",")})`)
    .limit(20);

  if (!randomData) return highRatedData || [];

  const shuffled = [...randomData].sort(() => Math.random() - 0.5);
  const needed = CARDS_PER_PAGE - (highRatedData?.length || 0);

  return [...(highRatedData || []), ...shuffled.slice(0, needed)];
};

const fetchMoreRandomPlaces = async (
  regionId: number,
  excludeIds: string[],
  count: number
): Promise<PlaceSummary[]> => {
  // 다음 페이지를 채울 만큼 넉넉하게 조회 (3배)
  const { data } = await supabase
    .from("place")
    .select("*")
    .eq("region_id", regionId)
    .not("place_id", "in", `(${excludeIds.join(",")})`)
    .limit(count * 3);

  if (!data || data.length === 0) return [];

  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const RelatedPlacesSection: React.FC<RelatedPlacesSectionProps> = ({
  currentPlaceId,
  regionId,
}) => {
  const [allPlaces, setAllPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const places = await fetchInitialPlaces(regionId, currentPlaceId);
        setAllPlaces(places);
        setCurrentPage(0);
      } catch (err) {
        console.error("❌ 추천 장소 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [regionId, currentPlaceId]);

  const handleNext = async () => {
    const nextPage = currentPage + 1;
    const requiredPlaces = (nextPage + 1) * CARDS_PER_PAGE;

    // 다음 페이지에 필요한 장소가 부족하면 추가 로딩
    if (allPlaces.length < requiredPlaces) {
      const usedIds = [currentPlaceId, ...allPlaces.map((p) => p.place_id)];
      const newPlaces = await fetchMoreRandomPlaces(
        regionId,
        usedIds,
        CARDS_PER_PAGE
      );

      if (newPlaces.length > 0) {
        setAllPlaces((prev) => [...prev, ...newPlaces]);
      } else {
        // 더 이상 로드할 장소가 없음을 표시 (슬라이드 비활성화 로직에 영향)
        // 현재는 무한 스크롤이 아니므로 그냥 다음 페이지로 넘어가지 않도록 처리하지 않음
      }
    }

    setCurrentPage(nextPage);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  if (loading) {
    return (
      <section className="related-places-section">
        <h2>같이 가보면 좋을 장소</h2>
        <div style={{ padding: "20px", color: "#666" }}>
          추천 장소를 로딩 중입니다...
        </div>
      </section>
    );
  }

  if (allPlaces.length === 0) {
    return (
      <section className="related-places-section">
        <h2>같이 가보면 좋을 장소</h2>
        <p className="no-places-text">추천 장소가 없습니다.</p>
      </section>
    );
  }

  const startIdx = currentPage * CARDS_PER_PAGE;
  const endIdx = startIdx + CARDS_PER_PAGE;
  const visiblePlaces = allPlaces.slice(startIdx, endIdx);

  const isPrevDisabled = currentPage === 0;
  // 다음 장소가 아예 없어서 다음 페이지가 비어있을 때만 비활성화
  const isNextDisabled =
    endIdx >= allPlaces.length && visiblePlaces.length < CARDS_PER_PAGE;

  return (
    <section className="related-places-section">
      <div className="section-header">
        <h2>같이 가보면 좋을 장소</h2>
        <div className="navigation-buttons">
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className="nav-button"
            aria-label="이전 장소"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="nav-button"
            aria-label="다음 장소"
          >
            →
          </button>
        </div>
      </div>

      <div className="cards-container">
        {visiblePlaces.map((place) => (
          <PlaceCard key={place.place_id} place={place as any} />
        ))}
      </div>

      <style jsx>{`
        .related-places-section {
          padding: 40px 20px;
          border-top: 1px solid #e5e5e5;
          margin-top: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .navigation-buttons {
          display: flex;
          gap: 8px;
        }

        .nav-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e5e5e5;
          background-color: white;
          color: #1a1a1a;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .nav-button:hover:not(:disabled) {
          background-color: #f5f5f5;
          border-color: #d0d0d0;
        }

        .nav-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background-color: #fafafa;
        }

        .cards-container {
          display: grid;
          /* 💡 수정: 카드를 3개로 키우기 위해 3열 레이아웃으로 변경 */
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .no-places-text {
          color: #999;
          padding: 20px;
          text-align: center;
        }

        /* 반응형 처리 */
        @media (max-width: 1400px) {
          /* 1400px 이상에서는 3열, 1400px 미만에서는 3열 유지 */
        }

        @media (max-width: 1024px) {
          .cards-container {
            /* 1024px 미만에서는 2열로 변경 */
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .cards-container {
            /* 640px 미만에서는 1열로 변경 */
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default RelatedPlacesSection;
