// component/review/ReviewButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewForm from './ReviewForm';
import { saveReview } from '@/lib/reviewStore';
import type { TravelSummary } from '@/type/travel';

interface ReviewButtonProps {
  places: TravelSummary[];
}

export default function ReviewButton({ places }: ReviewButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectingPlace, setIsSelectingPlace] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    placeName: string;
  } | null>(null);

  const handlePlaceSelect = (place: TravelSummary) => {
    setSelectedPlace({
      placeId: place.place_id,
      placeName: place.place_name,
    });
    setIsSelectingPlace(false);
  };

  const handleReviewSubmit = (reviewData: any) => {
    console.log('리뷰 제출:', reviewData);
    
    // 리뷰 저장
    saveReview({
      placeId: reviewData.placeId,
      placeName: selectedPlace?.placeName || '',
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      author: reviewData.author,
      images: reviewData.images,
    });
    
    // 모달 닫기
    setIsModalOpen(false);
    setSelectedPlace(null);
    
    // 리뷰 페이지로 이동
    setTimeout(() => {
      router.push('/review');
    }, 500);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsSelectingPlace(false);
    setSelectedPlace(null);
  };

  const openModal = () => {
    setIsSelectingPlace(true);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={openModal}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          padding: '16px 28px',
          borderRadius: '50px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.5)';
          e.currentTarget.style.backgroundColor = '#4f46e5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
          e.currentTarget.style.backgroundColor = '#6366f1';
        }}
        title="리뷰 작성하기"
      >
        <span style={{ fontSize: '20px' }}>✍️</span>
        리뷰 등록하기
      </button>

      {/* 모달 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleCancel}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'white',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                zIndex: 10,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              ✕
            </button>

            {/* 장소 선택 화면 */}
            {isSelectingPlace && !selectedPlace && (
              <div style={{ padding: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                  어떤 장소의 리뷰를 작성하시겠어요?
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                  리뷰를 작성할 여행지를 선택해주세요
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '15px',
                  }}
                >
                  {places.map((place) => (
                    <button
                      key={place.place_id}
                      onClick={() => handlePlaceSelect(place)}
                      style={{
                        padding: '20px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100px',
                          borderRadius: '8px',
                          backgroundImage: `url(${place.place_image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          marginBottom: '12px',
                        }}
                      />
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                        {place.place_name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                        ⭐ {place.average_rating.toFixed(1)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 리뷰 작성 폼 */}
            {selectedPlace && (
              <ReviewForm
                placeId={selectedPlace.placeId}
                placeName={selectedPlace.placeName}
                onSubmit={handleReviewSubmit}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}