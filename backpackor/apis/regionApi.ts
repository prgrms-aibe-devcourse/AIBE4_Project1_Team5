// 지역 관련 API
import { createBrowserClient } from "@/lib/supabaseClient";
import type { Region, RegionOption } from "@/types/region";

// DB에서 모든 지역 목록 가져오기
export const getRegions = async (): Promise<Region[]> => {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("region")
      .select("region_id, region_name")
      .order("region_id", { ascending: true });

    if (error) {
      console.error("지역 목록 조회 실패:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("지역 목록 조회 실패:", error);
    return [];
  }
};

// 필터용 지역 옵션 가져오기 ("전체" 포함)
export const getRegionOptions = async (): Promise<RegionOption[]> => {
  const regions = await getRegions();

  // "전체" 옵션을 맨 앞에 추가
  return [
    { region_id: null, region_name: "전체" },
    ...regions,
  ];
};

// region_name으로 region_id 찾기
export const getRegionIdByName = async (regionName: string): Promise<number | null> => {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("region")
      .select("region_id")
      .eq("region_name", regionName)
      .single();

    if (error || !data) {
      return null;
    }

    return data.region_id;
  } catch (error) {
    console.error("region_id 조회 실패:", error);
    return null;
  }
};
