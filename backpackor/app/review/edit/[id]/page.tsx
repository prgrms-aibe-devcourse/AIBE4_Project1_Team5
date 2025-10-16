  'use client';

  import { use, useEffect } from 'react';
  import { useRouter } from 'next/navigation';

  interface PageProps {
    params: Promise<{
      id: string;
    }>;
  }

  export default function ReviewEditPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    useEffect(() => {
      // 새로운 쿼리 파라미터 방식으로 리다이렉트
      router.replace(`/review/write?edit=${id}`);
    }, [id, router]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">리다이렉트 중...</div>
      </div>
    );
  }