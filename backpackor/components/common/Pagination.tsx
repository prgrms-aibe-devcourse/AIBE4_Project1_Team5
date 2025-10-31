"use client";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    // 표시할 페이지 범위 계산
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 10;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            const start = Math.max(1, currentPage - 4);
            const end = Math.min(totalPages, start + 9);

            const startIndex = end === totalPages ? Math.max(1, end - 9) : start;
            for (let i = startIndex; i <= end; i++) pages.push(i);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-10 mb-6">
            {/* 처음으로 */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                title="첫 페이지"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            </button>

            {/* 10페이지 이전 */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 10))}
                disabled={currentPage <= 10}
                className="px-4 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
                이전
            </button>

            {/* 페이지 번호 */}
            <div className="flex gap-1.5 mx-2">
                {pages.map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === "number" && onPageChange(page)}
                        className={`min-w-[42px] h-10 px-3 rounded-lg font-medium transition-all duration-200 ${
                            page === currentPage
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                                : "bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* 10페이지 다음 */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 10))}
                disabled={currentPage > totalPages - 10}
                className="px-4 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
                다음
            </button>

            {/* 마지막으로 */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                title="마지막 페이지"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};
