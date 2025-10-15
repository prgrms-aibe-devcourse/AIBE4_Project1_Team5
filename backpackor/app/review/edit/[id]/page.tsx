// app/review/edit/[id]/page.tsx
'use client';

import { use } from 'react';
import ReviewForm from '@/component/review/ReviewForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReviewEditPage({ params }: PageProps) {
  const { id } = use(params);

  return <ReviewForm reviewId={id} />;
}