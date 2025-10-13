// component/review/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Star, X, Upload } from 'lucide-react';

interface ReviewFormProps {
  placeId: string;
  placeName: string;
  onSubmit: (reviewData: ReviewData) => void;
  onCancel: () => void;
}

interface ReviewData {
  placeId: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  images: string[];
}

export default function ReviewForm({ 
  placeId, 
  placeName, 
  onSubmit, 
  onCancel 
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleStarClick = (starIndex: number, isHalf: boolean) => {
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    setRating(newRating);
  };

  const handleStarHover = (starIndex: number, isHalf: boolean) => {
    const newHoverRating = isHalf ? starIndex - 0.5 : starIndex;
    setHoverRating(newHoverRating);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      alert('최대 5개의 이미지만 등록할 수 있습니다!');
      return;
    }

    const newImages: string[] = [];
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === filesToProcess) {
              setImages([...images, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('별점을 선택해주세요!');
      return;
    }
    
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('모든 항목을 입력해주세요!');
      return;
    }

    const reviewData: ReviewData = {
      placeId,
      rating: parseFloat(rating.toFixed(1)),
      title,
      content,
      author,
      images
    };

    console.log('제출된 리뷰:', reviewData);
    
    // 부모 컴포넌트에 리뷰 데이터 전달
    onSubmit(reviewData);
    
    setSubmitted(true);
    
    // 2초 후 모달 닫기
    setTimeout(() => {
      onCancel();
    }, 2000);
  };

  const renderStars = () => {
    const currentRating = hoverRating || rating;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(currentRating);
      const isHalfFilled = i === Math.ceil(currentRating) && currentRating % 1 !== 0;

      stars.push(
        <div key={i} className="relative inline-block">
          <div className="flex">
            {/* 왼쪽 반 */}
            <button
              type="button"
              onClick={() => handleStarClick(i, true)}
              onMouseEnter={() => handleStarHover(i, true)}
              onMouseLeave={() => setHoverRating(0)}
              className="relative w-4 overflow-hidden transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  isFilled || isHalfFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
            {/* 오른쪽 반 */}
            <button
              type="button"
              onClick={() => handleStarClick(i, false)}
              onMouseEnter={() => handleStarHover(i, false)}
              onMouseLeave={() => setHoverRating(0)}
              className="relative w-4 overflow-hidden transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                } transition-colors -ml-4`}
              />
            </button>
          </div>
        </div>
      );
    }

    return stars;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {placeName} 리뷰 작성
      </h1>
      <p className="text-gray-600 mb-8">소중한 의견을 들려주세요</p>

      {submitted ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            리뷰가 등록되었습니다!
          </h2>
          <p className="text-gray-600">소중한 의견 감사합니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 별점 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              별점을 선택해주세요 * (0.5점 단위)
            </label>
            <div className="flex gap-1">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating.toFixed(1)}점을 선택하셨습니다
              </p>
            )}
          </div>

          {/* 제목 입력 */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              리뷰 제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="리뷰 제목을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/100
            </p>
          </div>

          {/* 내용 입력 */}
          <div>
            <label 
              htmlFor="content" 
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              리뷰 내용 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상세한 리뷰를 작성해주세요"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/1000
            </p>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이미지 첨부 (최대 5개)
            </label>
            
            {/* 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 업로드 버튼 */}
            {images.length < 5 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">
                    클릭하여 이미지 업로드
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {images.length}/5 업로드됨
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 작성자 입력 */}
          <div>
            <label 
              htmlFor="author" 
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              작성자 *
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              maxLength={50}
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white font-semibold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              리뷰 등록하기
            </button>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>* 표시된 항목은 필수 입력 항목입니다</p>
      </div>
    </div>
  );
}