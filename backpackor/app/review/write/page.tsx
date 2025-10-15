// app/write/page.tsx
'use client';

import ReviewForm from '@/component/review/ReviewForm';

export default function ReviewWritePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ReviewForm />
      </div>
    </div>
  );
}