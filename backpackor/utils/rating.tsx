// 별점 렌더링 유틸리티
import { ReactElement } from "react";

export const renderStars = (rating: number): ReactElement[] => {
  const stars: ReactElement[] = [];
  const roundedRating = Math.round(rating);

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`text-2xl ${
          i <= roundedRating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    );
  }

  return stars;
};