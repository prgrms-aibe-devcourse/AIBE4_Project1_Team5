"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { TravelSummary } from "@/type/travel";

interface TravelCardProps {
  place: TravelSummary;
}

const TravelCard: React.FC<TravelCardProps> = ({ place }) => {
  const router = useRouter();

  // ✅ place가 없거나 필수 데이터가 없으면 렌더링하지 않음
  if (!place || !place.place_id) {
    return null;
  }

  const handleClick = () => {
    router.push(`/place/${place.place_id}`);
  };

  return (
    <>
      <div className="travel-card" onClick={handleClick}>
        <div
          className="card-image"
          style={{ 
            backgroundImage: `url(${place.place_image || '/default-image.jpg'})` 
          }}
        />
        <div className="card-info">
          <h3 className="card-title">{place.place_name || '이름 없음'}</h3>
          <p className="card-rating">
            ⭐ {place.average_rating ? place.average_rating.toFixed(1) : '0.0'}
          </p>
        </div>
      </div>

      <style jsx>{`
        .travel-card {
          width: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .travel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .card-image {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          flex-shrink: 0;
        }

        .card-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-rating {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default TravelCard;