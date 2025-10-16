// component/review/ReviewButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteReview } from '@/lib/reviewStoreSupabase';


interface EditButtonProps {
  reviewId: string;
}

export function EditButton({ reviewId }: EditButtonProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/review/edit/${reviewId}`);
  };

  return (
    <button
      onClick={handleEdit}
      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    >
      수정
    </button>
  );
}

interface DeleteButtonProps {
  reviewId: string;
  onDeleted?: () => void;
}

export function DeleteButton({ reviewId, onDeleted }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    const confirmed = confirm('정말 이 리뷰를 삭제하시겠습니까?');
    if (!confirmed) return;

    setIsDeleting(true);
    const success = await deleteReview(reviewId);
    
    if (success) {
      alert('리뷰가 삭제되었습니다.');
      if (onDeleted) {
        onDeleted();
      } else {
        router.push('/review');
        router.refresh();
      }
    } else {
      alert('리뷰 삭제에 실패했습니다.');
    }
    
    setIsDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  );
}

interface WriteButtonProps {
  className?: string;
}

export function WriteButton({ className = '' }: WriteButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/review/write')}
      className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors ${className}`}
    >
      리뷰 작성
    </button>
  );
}