// 공통 지역 필터 컴포넌트
"use client";

import { useEffect, useState } from "react";
import { getRegionOptions } from "@/apis/regionApi";
import type { RegionOption } from "@/types/region";

interface RegionFilterProps {
  selectedRegionId: number | null; // null은 "전체"
  onRegionChange: (regionId: number | null) => void;
  className?: string;
  allowedRegionIds?: number[]; // 표시할 region_id 제한 (선택사항)
}

export const RegionFilter = ({
  selectedRegionId,
  onRegionChange,
  className = "",
  allowedRegionIds,
}: RegionFilterProps) => {
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoading(true);
      const data = await getRegionOptions();

      // allowedRegionIds가 있으면 해당 지역만 필터링
      const filteredData = allowedRegionIds && allowedRegionIds.length > 0
        ? data.filter(region =>
            region.region_id === null || allowedRegionIds.includes(region.region_id)
          )
        : data;

      setRegions(filteredData);
      setIsLoading(false);
    };
    fetchRegions();
  }, [allowedRegionIds]);

  const selectedRegionName =
    regions.find((r) => r.region_id === selectedRegionId)?.region_name || "전체";

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-semibold border rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4.75A.75.75 0 0 1 2.75 4h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 3.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8.75Z" />
        </svg>
        {isLoading
          ? "로딩 중..."
          : selectedRegionName === "전체"
            ? "지역별 필터"
            : selectedRegionName}
      </button>

      {isDropdownOpen && !isLoading && (
        <ul className="absolute z-10 mt-1 w-48 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {regions.map((region) => (
            <li
              key={region.region_id ?? "all"}
              onClick={() => {
                onRegionChange(region.region_id);
                setIsDropdownOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                selectedRegionId === region.region_id ? "bg-blue-50 font-semibold" : ""
              }`}
            >
              {region.region_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
