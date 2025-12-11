// component/review/ReviewButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { deleteReview } from '@/apis/reviewApi';
import { PlaceCache } from '@/lib/placeCache';
import { HomeCache } from '@/lib/homeCache';
import { createBrowserClient } from '@/lib/supabaseClient';

// ========== 리뷰 작성 버튼 ==========
interface WriteButtonProps {
  className?: string;
}

export function WriteButton({ className = '' }: WriteButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/review/write')}
      className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors ${className}`}
    >
      리뷰 작성
    </button>
  );
}

// ========== 리뷰 수정 버튼 ==========
interface EditButtonProps {
  reviewId: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function EditButton({ reviewId, className = '', onClick }: EditButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    if (onClick) {
      onClick(e);
    } else {
      // 올바른 수정 페이지 경로로 이동
      router.push(`/review/write?edit=${reviewId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors ${className}`}
    >
      수정
    </button>
  );
}

// ========== 리뷰 삭제 버튼 ==========
interface DeleteButtonProps {
  reviewId: string;
  className?: string;
  onDelete?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

export function DeleteButton({ reviewId, className = '', onDelete, onClick }: DeleteButtonProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    if (onClick) {
      onClick(e);
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const success = await deleteReview(reviewId);

      if (success) {
        // 리뷰 삭제 시 여행지 캐시 무효화 (평점/리뷰 개수 변경됨)
        console.log('[리뷰 삭제] 캐시 무효화 시작');
        PlaceCache.clearAllCache();
        HomeCache.clear(); // 메인페이지 캐시도 무효화

        // TOP 3 Materialized View 갱신
        console.log('[리뷰 삭제] TOP 3 갱신 시작');
        const supabase = createBrowserClient();
        await supabase.rpc('refresh_top_places');

        alert('리뷰가 삭제되었습니다.');
        if (onDelete) {
          onDelete(); // 삭제 후 콜백 실행
        } else {
          router.push('/review'); // 리뷰 목록으로 이동
          router.refresh();
        }
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors ${className}`}
    >
      삭제
    </button>
  );
}

// ========== 리뷰 수정/삭제 버튼 그룹 ==========
interface ReviewActionButtonsProps {
  reviewId: string;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  className?: string;
}

export function ReviewActionButtons({ 
  reviewId, 
  onEdit, 
  onDelete, 
  className = '' 
}: ReviewActionButtonsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <EditButton 
        reviewId={reviewId} 
        onClick={onEdit}
        className="flex-1"
      />
      <DeleteButton 
        reviewId={reviewId} 
        onDelete={onDelete}
        className="flex-1"
      />
    </div>
  );
}