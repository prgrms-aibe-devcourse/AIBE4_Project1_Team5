// app/planner/ai/style/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * AI 여행 계획 생성을 위한 여행 스타일 선택 페이지 컴포넌트
 */
function AiPlannerStyleContent() {
  const searchParams = useSearchParams();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // .get('region') 대신 .getAll('region')을 사용하여 모든 지역 정보를 배열로 가져옵니다.
  const regions = searchParams.getAll("region");
  const regionIds = searchParams.getAll("region_id");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const companion = searchParams.get("companion");

  // 카테고리 매핑: 사용자 선택 -> DB place_category (9개 대분류)
  const categoryMapping: Record<string, string[]> = {
    nature: [
      "산", "계곡", "폭포", "호수", "강", "섬", "해수욕장", "해안절경",
      "동굴", "기암괴석", "약수터", "희귀동.식물"
    ],
    park: [
      "국립공원", "도립공원", "군립공원", "공원", "수목원", "자연휴양림",
      "자연생태관광지", "관광단지", "테마공원"
    ],
    culture: [
      "고궁", "성", "사찰", "유적지/사적지", "생가", "고택", "한옥", "문",
      "동상", "기념탑/기념비/전망대", "등대", "터널", "다리/대교",
      "종교성지", "안보관광"
    ],
    museum: [
      "박물관", "미술관/화랑", "전시관", "기념관", "문화원", "전시회", "도서관"
    ],
    experience: [
      "농.산.어촌 체험", "전통체험", "이색체험", "공예/공방", "민속마을",
      "문화전수시설", "홈스테이", "산사체험"
    ],
    performance: [
      "공연장", "전통공연", "연극", "무용", "영화", "영화관", "클래식음악회",
      "대중콘서트", "문화관광축제", "일반축제", "박람회"
    ],
    sports: [
      "스키/스노보드", "썰매장", "골프", "승마", "자전거하이킹", "MTB",
      "도보코스", "트래킹", "암벽등반", "인라인(실내 인라인 포함)", "스케이트",
      "카트", "ATV", "오프로드", "경기장", "경마", "경륜", "사격장", "복합 레포츠",
      "수상레포츠", "래프팅", "카약/카누", "윈드서핑/제트스키", "유람선/잠수함관광",
      "요트", "스노쿨링/스킨스쿠버다이빙", "수영", "민물낚시", "바다낚시",
      "헹글라이딩/패러글라이딩", "열기구", "초경량비행", "스카이다이빙",
      "항공레포츠", "번지점프"
    ],
    shopping: [
      "백화점", "대형마트", "상설시장", "5일장", "전문매장/상가",
      "특산물판매점", "대형서점"
    ],
    food: [
      "한식", "중식", "일식", "서양식", "이색음식점", "카페/전통찻집",
      "식음료", "맛코스"
    ]
  };

  const styleOptions = [
    {
      name: "자연/경관",
      value: "nature",
      icon: "🏔️",
      desc: "산, 계곡, 폭포, 호수",
      categories: categoryMapping.nature
    },
    {
      name: "공원/휴양",
      value: "park",
      icon: "🌳",
      desc: "국립공원, 수목원, 테마파크",
      categories: categoryMapping.park
    },
    {
      name: "문화/역사",
      value: "culture",
      icon: "🏛️",
      desc: "고궁, 사찰, 유적지",
      categories: categoryMapping.culture
    },
    {
      name: "박물관/전시",
      value: "museum",
      icon: "🎨",
      desc: "박물관, 미술관, 전시관",
      categories: categoryMapping.museum
    },
    {
      name: "체험/학습",
      value: "experience",
      icon: "👩‍🌾",
      desc: "전통체험, 공예, 농촌체험",
      categories: categoryMapping.experience
    },
    {
      name: "공연/문화예술",
      value: "performance",
      icon: "🎭",
      desc: "공연장, 연극, 콘서트, 축제",
      categories: categoryMapping.performance
    },
    {
      name: "레저/스포츠",
      value: "sports",
      icon: "⛷️",
      desc: "스키, 수상레포츠, 등산",
      categories: categoryMapping.sports
    },
    {
      name: "쇼핑",
      value: "shopping",
      icon: "🛍️",
      desc: "백화점, 시장, 특산물",
      categories: categoryMapping.shopping
    },
    {
      name: "음식/카페",
      value: "food",
      icon: "🍴",
      desc: "맛집, 카페, 음식점",
      categories: categoryMapping.food
    }
  ];

  const handleStyleClick = (styleValue: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleValue)
        ? prev.filter((s) => s !== styleValue)
        : [...prev, styleValue]
    );
  };

  /**
   * @param isNext '다음 단계'로 갈 것인지 여부
   */
  const createUrl = (isNext: boolean) => {
    const params = new URLSearchParams();

    // 이전 단계들에서 받아온 파라미터들을 모두 추가합니다.
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    regions.forEach((region) => params.append("region", region)); // 모든 지역 추가
    regionIds.forEach((id) => params.append("region_id", id));
    if (companion) params.append("companion", companion);

    if (isNext) {
      // '다음 단계'일 경우, 현재 페이지에서 선택한 스타일 정보를 추가합니다.
      selectedStyles.forEach((style) => params.append("style", style));
      return `/planner/ai/speed?${params.toString()}`;
    } else {
      // '이전 단계'일 경우, 동행 선택 페이지로 돌아갑니다.
      return `/planner/ai/companion?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
              5
            </div>
          </div>
        </div>

        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-3 text-sm tracking-wider uppercase">
            Step 3 of 5
          </p>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            어떤 스타일의 여행을 원하시나요?
          </h1>
          <p className="text-gray-500 text-lg">
            원하는 스타일을 모두 선택해주세요 (복수 선택 가능)
          </p>
        </div>

        {/* 스타일 옵션 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStyleClick(option.value)}
              className={`group relative p-6 bg-white rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                selectedStyles.includes(option.value)
                  ? "border-blue-500 shadow-lg ring-4 ring-blue-100"
                  : "border-gray-200 hover:border-blue-300 shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`text-5xl transition-transform duration-200 ${
                    selectedStyles.includes(option.value)
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {option.icon}
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-base mb-1">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </div>
              </div>
              {selectedStyles.includes(option.value) && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 선택된 스타일 카운터 */}
        {selectedStyles.length > 0 && (
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {selectedStyles.length}개 선택됨
            </span>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center gap-4">
          <Link
            href={createUrl(false)}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            이전 단계
          </Link>
          <Link
            href={selectedStyles.length > 0 ? createUrl(true) : "#"}
            className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all ${
              selectedStyles.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (selectedStyles.length === 0) e.preventDefault();
            }}
          >
            다음 단계
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AiPlannerStylePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AiPlannerStyleContent />
    </Suspense>
  );
}
