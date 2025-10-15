// app/review/edit/[reviewId]/page.tsx
'use client';

import { use } from 'react';
import ReviewForm from '@/component/review/ReviewForm';

interface PageProps {
  params: Promise<{
    reviewId: string;
  }>;
}

export default function ReviewEditPage({ params }: PageProps) {
  const { reviewId } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ReviewForm reviewId={reviewId} />
      </div>
    </div>
  );
}