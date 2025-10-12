// component/place/PlacesList.tsx
"use client";

import { useState, useTransition } from "react";
import TravelCard from "@/component/place/TravelCard";
import type { TravelSummary } from "@/type/travel";

type Props = {
  initial: TravelSummary[]; // 서버에서 6개
};

export default function PlacesList({ initial }: Props) {
  const [items, setItems] = useState<TravelSummary[]>(initial);
  const [offset, setOffset] = useState<number>(initial.length);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const loadMore = async () => {
    if (isPending || done) return;
    startTransition(async () => {
      const res = await fetch(`/api/places?limit=30&offset=${offset}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const { data } = await res.json();
      if (!data || data.length === 0) {
        setDone(true);
        return;
      }
      setItems((prev) => [...prev, ...data]);
      setOffset((o) => o + data.length);
      if (data.length < 30) setDone(true);
    });
  };

  return (
    <>
      <div className="card-grid">
        {items.map((place) => (
          <TravelCard key={place.place_id} place={place} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={loadMore}
          disabled={isPending || done}
          className="more-button"
        >
          {done
            ? "모든 여행지를 확인했어요"
            : isPending
            ? "불러오는 중..."
            : "여행지 더보기"}
        </button>
      </div>

      <style jsx>{`
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .more-button {
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
        }
        .more-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
