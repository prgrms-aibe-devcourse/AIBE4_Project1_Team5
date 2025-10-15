// app/review/write/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReviewForm from '@/component/review/ReviewForm';
import { saveReview } from '@/lib/reviewStore';

export default function ReviewWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSelectingPlace, setIsSelectingPlace] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    placeName: string;
  } | null>(null);

  // 여행지 목록
  const places = [
    { place_id: 'jeju-mock-id', place_name: '제주도', place_image: 'https://picsum.photos/400/200?random=1' },
    { place_id: 'busan-mock-id', place_name: '부산', place_image: 'https://picsum.photos/400/200?random=2' },
    { place_id: 'seoul-mock-id', place_name: '서울', place_image: 'https://picsum.photos/400/200?random=3' },
    { place_id: 'gyeongju-mock-id', place_name: '경주', place_image: 'https://picsum.photos/400/200?random=4' },
    { place_id: 'jeonju-mock-id', place_name: '전주', place_image: 'https://picsum.photos/400/200?random=5' },
    { place_id: 'gangneung-mock-id', place_name: '강릉', place_image: 'https://picsum.photos/400/200?random=6' },
  ];

  // URL에서 placeId 확인
  useEffect(() => {
    const placeId = searchParams.get('placeId');
    if (placeId) {
      const place = places.find(p => p.place_id === placeId);
      if (place) {
        setSelectedPlace({
          placeId: place.place_id,
          placeName: place.place_name,
        });
        setIsSelectingPlace(false);
      }
    }
  }, [searchParams]);

  const handlePlaceSelect = (place: any) => {
    setSelectedPlace({
      placeId: place.place_id,
      placeName: place.place_name,
    });
    setIsSelectingPlace(false);
    router.push(`/review/write?placeId=${place.place_id}`); // 링크 설정 해야함 (251013)
  };

  const handleReviewSubmit = (reviewData: any) => {
    if (!selectedPlace) return;

    saveReview({
      placeId: reviewData.placeId,
      placeName: selectedPlace.placeName,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      author: reviewData.author,
      images: reviewData.images,
    });

    router.push('/review');
  };

  const handleCancel = () => {
    if (!isSelectingPlace && selectedPlace) {
      setIsSelectingPlace(true);
      setSelectedPlace(null);
      router.push('/review/write');
    } else {
      router.push('/review');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleCancel}
          className="mb-4 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
        >
          ← 뒤로가기
        </button>

        <div className="bg-white rounded-2xl shadow-xl">
          {isSelectingPlace && !selectedPlace && (
            <div className="p-10">
              <h2 className="text-3xl font-bold mb-3 text-gray-800">
                다녀온 여행지를 선택해주세요
              </h2>
              <p className="text-gray-600 mb-8">
                리뷰를 작성할 여행지를 선택하시면 리뷰 작성 화면으로 이동합니다
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {places.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => handlePlaceSelect(place)}
                    className="p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all transform hover:-translate-y-1 hover:shadow-lg text-left"
                  >
                    <div
                      className="w-full h-32 rounded-lg mb-3 bg-cover bg-center"
                      style={{ backgroundImage: `url(${place.place_image})` }}
                    />
                    <div className="font-semibold text-lg text-gray-800">
                      {place.place_name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlace && !isSelectingPlace && (
            <ReviewForm
              placeId={selectedPlace.placeId}
              placeName={selectedPlace.placeName}
              onSubmit={handleReviewSubmit}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}