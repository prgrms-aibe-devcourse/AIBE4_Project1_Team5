// 지역 타입 정의
export interface Region {
  region_id: number;
  region_name: string;
}

// 지역 필터 옵션 (전체 포함)
export interface RegionOption {
  region_id: number | null; // null은 "전체"를 의미
  region_name: string;
}
