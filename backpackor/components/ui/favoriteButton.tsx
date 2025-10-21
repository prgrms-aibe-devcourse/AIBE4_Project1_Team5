// component/ui/favoriteButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  placeId: string;
  userId: string | null;
}

export default function FavoriteButton({
  placeId,
  userId,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 찜 여부 초기 조회
  useEffect(() => {
    if (!userId) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch(
          `/api/favorite?userId=${userId}&placeId=${placeId}`
        );
        if (res.ok) {
          const data = await res.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error("찜 여부 조회 실패:", error);
      }
    };

    checkFavorite();
  }, [userId, placeId]);

  const toggleFavorite = async () => {
    // 로그인하지 않은 경우
    if (!userId) {
      if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    setLoading(true);
    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch("/api/favorite", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, placeId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsFavorite(!isFavorite);
      } else {
        alert(data.error || "오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("찜 토글 오류:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFavorite ? "찜 해제하기" : "찜하기"}
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        fontSize: "28px",
        background: "rgba(255, 255, 255, 0.9)",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        opacity: loading ? 0.6 : 1,
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
      }}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}
