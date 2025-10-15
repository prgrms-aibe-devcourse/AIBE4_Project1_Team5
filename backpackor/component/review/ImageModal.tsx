// component/review/ImageModal.tsx
'use client';

import { useEffect, useState } from 'react';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ImageModal({ images, currentIndex, onClose, onNext, onPrev }: ImageModalProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지가 변경될 때마다 상태 초기화
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  const handleImageError = () => {
    console.error('이미지 로드 실패:', images[currentIndex]);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
      >
        ×
      </button>

      {/* 이전 버튼 */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 text-white text-5xl hover:text-gray-300 z-10"
        >
          ‹
        </button>
      )}

      {/* 이미지 컨테이너 */}
      <div 
        className="max-w-5xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 로딩 스피너 */}
        {isLoading && !imageError && (
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">로딩 중...</div>
          </div>
        )}

        {/* 에러 메시지 */}
        {imageError && (
          <div className="flex flex-col items-center justify-center h-64 text-white">
            <div className="text-xl mb-2">❌ 이미지를 불러올 수 없습니다</div>
            <div className="text-sm text-gray-400 break-all max-w-2xl">
              URL: {images[currentIndex]}
            </div>
          </div>
        )}

        {/* 이미지 */}
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain ${isLoading || imageError ? 'hidden' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        
        {/* 이미지 카운터 */}
        {images.length > 1 && (
          <div className="text-center text-white mt-4">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* 다음 버튼 */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 text-white text-5xl hover:text-gray-300 z-10"
        >
          ›
        </button>
      )}
    </div>
  );
}