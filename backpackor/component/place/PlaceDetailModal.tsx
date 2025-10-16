// component/place/PlaceDetailModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabaseClient";
import PlaceDetailContent from "@/component/place/PlaceDetailContent";
import { TravelDetail } from "@/type/travel";
import styles from "./PlaceDetailModal.module.css";

interface PlaceDetailModalProps {
  placeId: string;
  onClose: () => void;
}

export default function PlaceDetailModal({
  placeId,
  onClose,
}: PlaceDetailModalProps) {
  const [place, setPlace] = useState<TravelDetail | null>(null);
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

      setPlace(placeData as TravelDetail);

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
          .single();

        setInitialIsFavorite(!!favData);
      }

      setLoading(false);
    };

    fetchPlaceData();
  }, [placeId]);

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

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <div className={styles.modalContent}>
          <PlaceDetailContent
            place={place}
            initialIsFavorite={initialIsFavorite}
          />
        </div>
      </div>
    </div>
  );
}
