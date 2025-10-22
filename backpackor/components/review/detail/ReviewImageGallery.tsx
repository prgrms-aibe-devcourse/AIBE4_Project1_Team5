// 리뷰 이미지 갤러리 컴포넌트
import type { ReviewImage } from "@/types/review";

interface ReviewImageGalleryProps {
  images: ReviewImage[];
  onImageClick: (index: number) => void;
}

export const ReviewImageGallery = ({ images, onImageClick }: ReviewImageGalleryProps) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="p-8 border-b border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">사진</h2>
        <span className="text-sm text-gray-500">{images.length}장</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div
            key={image.review_image_id}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center"
            onClick={() => onImageClick(index)}
          >
            <img
              src={image.review_image}
              alt={`리뷰 이미지 ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};