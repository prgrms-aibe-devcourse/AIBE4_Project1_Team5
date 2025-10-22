// 리뷰 내용 컴포넌트

interface ReviewContentProps {
  content: string;
}

export const ReviewContent = ({ content }: ReviewContentProps) => {
  return (
    <div className="p-8">
      <div className="prose max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
          {content}
        </p>
      </div>
    </div>
  );
};