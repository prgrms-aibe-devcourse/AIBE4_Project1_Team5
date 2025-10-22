// 공통 로딩 스피너 컴포넌트

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  size = "md",
  message,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-16 h-16 border-4",
    lg: "w-24 h-24 border-4",
  };

  const spinner = (
    <>
      <div
        className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="text-gray-600 font-semibold mt-4">{message}</p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">{spinner}</div>
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center">{spinner}</div>;
};
