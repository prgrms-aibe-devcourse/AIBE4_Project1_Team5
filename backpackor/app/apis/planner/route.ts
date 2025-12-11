// [수정] Google AI SDK를 사용하기 위해 필요한 모듈을 import 합니다.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// 재시도 헬퍼 함수 (exponential backoff)
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(
    model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
    prompt: string,
    maxRetries = 3,
    baseDelay = 1000
) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`AI 요청 시도 ${attempt + 1}/${maxRetries}`);
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            lastError = error;
            const errorStatus = (error as { status?: number })?.status;
            const isRetryableError =
                errorStatus === 503 || // Service Unavailable
                errorStatus === 429 || // Too Many Requests
                errorStatus === 500;   // Internal Server Error

            if (isRetryableError && attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s
                console.warn(`AI 요청 실패 (${errorStatus}), ${delay/1000}초 후 재시도...`);
                await sleep(delay);
                continue;
            }

            // 재시도 불가능한 오류 또는 최대 재시도 횟수 도달
            throw error;
        }
    }

    throw lastError;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const searchParams = request.nextUrl.searchParams;

        // 1. 사용자 입력 정보 수집 (기존과 동일)
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const regionName = searchParams.get("region");
        const companion = searchParams.get("companion");
        const styles = searchParams.getAll("style");
        const speed = searchParams.get("speed");
        const transport = searchParams.getAll("transport");

        if (!regionName) {
            return NextResponse.json(
                { message: "지역이 선택되지 않았습니다." },
                { status: 400 }
            );
        }

        // 날짜 유효성 검사 (AI 생성 한계 확인)
        if (start && end) {
            const startDateObj = new Date(start);
            const endDateObj = new Date(end);
            const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // 속도별 최대 일수 제한
            const maxDaysLimit: Record<string, number> = {
                relaxed: 7,   // 여유: 최대 7일
                normal: 7,    // 보통: 최대 7일
                packed: 5,    // 빡빡: 최대 5일
            };

            const maxDays = maxDaysLimit[speed || "normal"] || 7;

            if (daysDiff > maxDays) {
                return NextResponse.json(
                    {
                        message: `AI 일정 생성은 ${speed === "relaxed" ? "여유 속도 기준 최대 7일" : speed === "packed" ? "빡빡한 속도 기준 최대 5일" : "보통 속도 기준 최대 7일"}까지 가능합니다.`,
                        error: "DAYS_LIMIT_EXCEEDED",
                        maxDays,
                        requestedDays: daysDiff
                    },
                    { status: 400 }
                );
            }
        }

        // 2. 스타일에 따른 카테고리 매핑
        const categoryMapping: Record<string, string[]> = {
            // 자연/경관
            nature: [
                "산", "계곡", "폭포", "호수", "강", "섬", "해수욕장", "해안절경",
                "동굴", "기암괴석", "약수터", "희귀동.식물", "분수"
            ],

            // 공원/휴양
            park: [
                "국립공원", "도립공원", "군립공원", "공원", "수목원", "자연휴양림",
                "자연생태관광지", "관광단지", "테마공원", "야영장,오토캠핑장",
                "온천/욕장/스파", "이색찜질방", "힐링코스"
            ],

            // 문화/역사
            culture: [
                "고궁", "성", "사찰", "유적지/사적지", "생가", "고택", "한옥", "문",
                "동상", "기념탑/기념비/전망대", "등대", "터널", "다리/대교",
                "종교성지", "안보관광", "유명건물"
            ],

            // 박물관/전시
            museum: [
                "박물관", "미술관/화랑", "전시관", "기념관", "문화원", "전시회", "도서관"
            ],

            // 체험/학습
            experience: [
                "농.산.어촌 체험", "전통체험", "이색체험", "공예/공방", "민속마을",
                "문화전수시설", "홈스테이", "산사체험"
            ],

            // 공연/문화예술
            performance: [
                "공연장", "전통공연", "연극", "무용", "영화", "영화관", "클래식음악회",
                "대중콘서트", "문화관광축제", "일반축제", "박람회"
            ],

            // 레저/스포츠
            sports: [
                "스키/스노보드", "썰매장", "골프", "승마", "자전거하이킹", "MTB",
                "도보코스", "트래킹", "암벽등반", "인라인(실내 인라인 포함)", "스케이트",
                "카트", "ATV", "오프로드", "경기장", "경마", "경륜", "사격장", "복합 레포츠",
                "수상레포츠", "래프팅", "카약/카누", "윈드서핑/제트스키", "유람선/잠수함관광",
                "요트", "스노쿨링/스킨스쿠버다이빙", "수영", "민물낚시", "바다낚시",
                "헹글라이딩/패러글라이딩", "열기구", "초경량비행", "스카이다이빙",
                "항공레포츠", "번지점프"
            ],

            // 쇼핑
            shopping: [
                "백화점", "대형마트", "상설시장", "5일장", "전문매장/상가",
                "특산물판매점", "대형서점", "이색거리"
            ],

            // 음식/카페
            food: [
                "한식", "중식", "일식", "서양식", "이색음식점", "카페/전통찻집",
                "식음료", "맛코스"
            ]
        };

        // 선택된 스타일에 해당하는 카테고리 추출
        const selectedCategories: string[] = [];
        styles.forEach((style) => {
            if (categoryMapping[style]) {
                selectedCategories.push(...categoryMapping[style]);
            }
        });

        // 3. 선택된 지역과 카테고리에 맞는 장소 목록 가져오기
        let query = supabase
            .from("place")
            .select("place_name, place_category, region!inner(region_name)")
            .eq("region.region_name", regionName);

        // 카테고리가 선택된 경우 필터링
        if (selectedCategories.length > 0) {
            query = query.in("place_category", selectedCategories);
        }

        const { data: places, error: placesError } = await query;

        if (placesError) {
            console.error("장소 조회 DB 오류:", placesError);
            throw new Error(
                `DB에서 '${regionName}' 지역의 장소 목록을 가져오는 데 실패했습니다.`
            );
        }

        let availablePlaces: string[] = [];

        // 카테고리 필터링 결과가 없으면 전체 장소에서 추천
        if (!places || places.length === 0) {
            console.warn("선택된 스타일에 맞는 카테고리가 없습니다. 전체 장소에서 추천합니다.", {
                regionName,
                selectedCategories,
                stylesCount: styles.length
            });

            // 카테고리 필터 없이 전체 장소 가져오기
            const { data: allPlaces, error: allPlacesError } = await supabase
                .from("place")
                .select("place_name, place_category, region!inner(region_name)")
                .eq("region.region_name", regionName);

            if (allPlacesError || !allPlaces || allPlaces.length === 0) {
                throw new Error(
                    `DB에서 '${regionName}' 지역의 장소 목록을 가져오는 데 실패했습니다.`
                );
            }

            availablePlaces = allPlaces.map((p) => p.place_name);
        } else {
            availablePlaces = places.map((p) => p.place_name);
        }

        // 4. 날짜별 일수 계산
        const startDateObj = new Date(start!);
        const endDateObj = new Date(end!);
        const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        let placeCountInstruction = "";
        let minPlaces = 4;
        let maxPlaces = 5;
        let speedDescription = "";

        if (speed === "relaxed") {
            minPlaces = 2;
            maxPlaces = 3;
            speedDescription = "느긋하게 여유를 즐기는";
            placeCountInstruction = `각 날짜마다 정확히 ${minPlaces}~${maxPlaces}개의 장소를 추천해야 합니다.`;
        } else if (speed === "packed") {
            minPlaces = 7;
            maxPlaces = 8;
            speedDescription = "최대한 많은 곳을 둘러보는 알찬";
            placeCountInstruction = `각 날짜마다 정확히 ${minPlaces}~${maxPlaces}개의 장소를 추천해야 합니다.`;
        } else {
            speedDescription = "적당히 활동적인";
            placeCountInstruction = `각 날짜마다 정확히 ${minPlaces}~${maxPlaces}개의 장소를 추천해야 합니다.`;
        }

        // 일정에 필요한 최소 장소 수 확인 - 부족하면 중복 허용
        const totalPlacesNeeded = daysDiff * minPlaces;
        const allowDuplicates = availablePlaces.length < totalPlacesNeeded;

        if (allowDuplicates) {
            console.warn("장소 수가 부족하여 중복을 허용합니다.", {
                available: availablePlaces.length,
                needed: totalPlacesNeeded,
                days: daysDiff,
                minPlaces
            });
        }

        // 5. 동행자별 맞춤 설명
        const companionContext: Record<string, string> = {
            alone: "혼자 여행하는 사람을 위한 일정으로, 자유롭고 개인적인 시간을 즐길 수 있는 장소를 우선적으로 선택하세요.",
            friends: "친구들과 함께하는 여행으로, 활동적이고 즐거운 경험을 할 수 있는 장소를 선택하세요.",
            family: "부모님과 함께하는 효도 여행으로, 편안하고 접근성이 좋은 장소를 선택하세요.",
            kids: "아이와 함께하는 가족 여행으로, 안전하고 교육적이며 재미있는 장소를 선택하세요.",
            couple: "연인과 함께하는 로맨틱한 여행으로, 분위기 좋고 사진 찍기 좋은 장소를 선택하세요.",
        };

        // 6. 이동수단별 고려사항
        const transportContext = transport.length > 0
            ? `이동수단은 ${transport.join(", ")}입니다. 이동 거리와 접근성을 고려하여 장소를 배치하세요.`
            : "";

        // 장소 목록을 JSON 배열로 변환 (토큰 효율성)
        const placesListJson = JSON.stringify(availablePlaces);

        // 7. 프롬프트 생성 (완전히 새로 작성)
        const prompt = `
${regionName}에서 ${daysDiff}일간 ${speedDescription} 여행 일정을 만들어주세요.

=== 여행자 정보 ===
• 동행: ${companion === "alone" ? "혼자" : companion === "friends" ? "친구들" : companion === "family" ? "부모님" : companion === "kids" ? "아이 동반 가족" : "연인"}
• 선호: ${styles.join(", ")}
• 이동수단: ${transport.length > 0 ? transport.join(", ") : "제한 없음"}

=== 핵심 제약 ===
1. 장소 개수: ${placeCountInstruction}
2. 사용 가능한 장소 목록 (JSON): ${placesListJson}
3. ${allowDuplicates ? "⚠️ 장소 부족 시 중복 허용 (단, 최소화할 것)" : "❌ 중복 금지 - 각 장소는 단 한 번만"}
4. 모든 날짜(1~${daysDiff}일차) 빠짐없이 작성

=== 일정 구성 가이드 ===
📍 **동선 최적화**
- 같은 지역/인근 장소를 묶어서 배치
- 이동 시간 최소화를 위해 지리적으로 가까운 곳 연결

🍽️ **시간대별 흐름** (${speed === "packed" ? "빡빡한 일정이므로 효율적으로" : speed === "relaxed" ? "여유롭게 휴식 시간 고려" : "적당한 속도로"})
- 오전: 활동적인 관광지/체험
- 점심: 식당/카페 (맛집 우선)
- 오후: 메인 관광지/쇼핑/공원
- 저녁: 야경/분위기 좋은 곳

👥 **동행 특성 반영**
${companionContext[companion!] || ""}

🎯 **선호 스타일 우선**
- 선택된 스타일(${styles.join(", ")})에 맞는 장소를 우선 배치
- 다양성과 테마의 균형 유지

=== 출력 형식 (JSON만) ===
{"title": "매력적인 여행 제목 (20자 이내)", "plan": {"1": [{"place_name": "장소명1"}, {"place_name": "장소명2"}], "2": [...]}}

⚠️ 중요: 순수 JSON만 출력하세요. 설명, 마크다운, 코드 블록 등 일체 제거!
`;

        const systemInstruction = `
당신은 10년 경력의 전문 여행 플래너입니다. 여행자의 취향과 상황을 완벽히 이해하고, 현지 사정에 정통한 베테랑입니다.

🎯 **핵심 임무**
${daysDiff}일간 ${regionName} 여행 일정을 최적화하여 만드세요.

✅ **필수 준수 사항**
1. 장소 개수: ${placeCountInstruction} (절대 엄수!)
2. 장소 선택: 제공된 목록에서만 선택 (절대 임의 장소 금지)
3. ${allowDuplicates ? "중복: 최소화 (불가피한 경우만)" : "중복: 절대 금지"}
4. 전체 기간: 1~${daysDiff}일차 모두 작성
5. plan 키: "1", "2", "3"... (숫자 문자열)

📝 **출력 규칙**
- 순수 JSON만 출력
- 마크다운 코드 블록 사용 금지
- 설명문, 주석 등 일체 제거
- 제목은 감성적이고 매력적으로 (예: "부산 바다와 힐링 여행", "제주 자연 속 힐링 3일")

🌟 **품질 기준**
- 동선: 지리적으로 효율적인 순서
- 다양성: 관광지, 맛집, 카페, 자연 등 균형
- 시간대: 아침-점심-오후-저녁 자연스러운 흐름
- 특화: 동행자와 선호 스타일에 최적화

예시:
{"title": "부산 해변과 맛집 탐방", "plan": {"1": [{"place_name": "해운대해수욕장"}, {"place_name": "광안리해수욕장"}], "2": [{"place_name": "감천문화마을"}, {"place_name": "자갈치시장"}]}}
`;

        // 8. AI에게 요청
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.85, // 더 창의적인 일정 생성
                topK: 50,
                topP: 0.95,
                maxOutputTokens: 8192, // 토큰 제한 대폭 증가 (packed 8개 대응)
                responseMimeType: "application/json", // JSON 응답 강제
            },
        });

        console.log("=== AI 요청 시작 ===");
        console.log("지역:", regionName);
        console.log("선택된 카테고리:", selectedCategories);
        console.log("사용 가능한 장소 수:", availablePlaces.length);
        console.log("여행 일수:", daysDiff);

        // 재시도 로직으로 AI 호출
        const result = await generateWithRetry(model, prompt, 3, 1000);

        // 응답 완전성 확인
        const finishReason = result.response.candidates?.[0]?.finishReason;
        console.log("=== AI 응답 상태 ===");
        console.log("완료 이유:", finishReason);

        if (finishReason && finishReason !== "STOP") {
            console.error("AI 응답이 비정상적으로 종료됨:", finishReason);
            return NextResponse.json(
                {
                    message: "AI 응답 생성이 중단되었습니다. 다시 시도해주세요.",
                    error: "INCOMPLETE_RESPONSE",
                    finishReason
                },
                { status: 500 }
            );
        }

        let aiResponseText = result.response.text();

        console.log("=== AI 응답 ===");
        console.log("원본 응답:", aiResponseText);

        // JSON 추출 및 정제
        aiResponseText = aiResponseText.trim();

        // 마크다운 코드 블록 제거
        if (aiResponseText.startsWith("```json")) {
            aiResponseText = aiResponseText.substring(7);
        } else if (aiResponseText.startsWith("```")) {
            aiResponseText = aiResponseText.substring(3);
        }

        if (aiResponseText.endsWith("```")) {
            aiResponseText = aiResponseText.substring(0, aiResponseText.length - 3);
        }

        aiResponseText = aiResponseText.trim();

        // 기본적인 JSON 완전성 검사
        const openBraces = (aiResponseText.match(/{/g) || []).length;
        const closeBraces = (aiResponseText.match(/}/g) || []).length;
        const openBrackets = (aiResponseText.match(/\[/g) || []).length;
        const closeBrackets = (aiResponseText.match(/\]/g) || []).length;

        if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
            console.error("불완전한 JSON 응답 감지:", {
                openBraces,
                closeBraces,
                openBrackets,
                closeBrackets,
                response: aiResponseText
            });
            return NextResponse.json(
                {
                    message: "AI 응답이 불완전합니다. 다시 시도해주세요.",
                    error: "INCOMPLETE_JSON",
                    details: "JSON 구조가 완전하지 않습니다."
                },
                { status: 500 }
            );
        }

        // JSON 파싱 시도
        let finalPlan;
        try {
            finalPlan = JSON.parse(aiResponseText);
        } catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
            console.error("JSON 파싱 실패:", parseError);
            console.error("파싱 시도한 텍스트:", aiResponseText);
            console.error("오류 위치:", errorMessage);
            return NextResponse.json(
                {
                    message: "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.",
                    error: "INVALID_JSON_FORMAT",
                    details: errorMessage
                },
                { status: 500 }
            );
        }

        // AI 응답 검증
        const validationErrors: string[] = [];

        // 1. 필수 필드 확인
        if (!finalPlan.title || typeof finalPlan.title !== "string") {
            validationErrors.push("제목(title)이 누락되었거나 형식이 잘못되었습니다.");
        }

        if (!finalPlan.plan || typeof finalPlan.plan !== "object") {
            validationErrors.push("일정(plan) 객체가 누락되었거나 형식이 잘못되었습니다.");
        } else {
            // 2. 모든 날짜 확인
            for (let day = 1; day <= daysDiff; day++) {
                const dayKey = String(day);
                if (!finalPlan.plan[dayKey]) {
                    validationErrors.push(`${day}일차 일정이 누락되었습니다.`);
                    continue;
                }

                const dayPlaces = finalPlan.plan[dayKey];
                if (!Array.isArray(dayPlaces)) {
                    validationErrors.push(`${day}일차 일정이 배열 형식이 아닙니다.`);
                    continue;
                }

                // 3. 각 날짜별 장소 개수 확인
                if (dayPlaces.length < minPlaces || dayPlaces.length > maxPlaces) {
                    validationErrors.push(
                        `${day}일차는 ${minPlaces}~${maxPlaces}개의 장소가 필요하지만 ${dayPlaces.length}개가 있습니다.`
                    );
                }

                // 4. 장소명 검증
                dayPlaces.forEach((place: unknown, idx: number) => {
                    const placeObj = place as { place_name?: unknown };
                    if (!placeObj.place_name || typeof placeObj.place_name !== "string") {
                        validationErrors.push(
                            `${day}일차 ${idx + 1}번째 장소의 place_name이 누락되었거나 형식이 잘못되었습니다.`
                        );
                    } else if (!availablePlaces.includes(placeObj.place_name)) {
                        validationErrors.push(
                            `${day}일차의 "${placeObj.place_name}"은(는) 선택 가능한 장소 목록에 없습니다.`
                        );
                    }
                });
            }

            // 5. 중복 장소 확인 (중복이 허용되지 않는 경우에만)
            if (!allowDuplicates) {
                const allPlaceNames: string[] = [];
                Object.values(finalPlan.plan).forEach((dayPlaces: unknown) => {
                    if (Array.isArray(dayPlaces)) {
                        dayPlaces.forEach((place: unknown) => {
                            const placeObj = place as { place_name?: string };
                            if (placeObj.place_name) {
                                allPlaceNames.push(placeObj.place_name);
                            }
                        });
                    }
                });

                const duplicates = allPlaceNames.filter(
                    (name, index) => allPlaceNames.indexOf(name) !== index
                );
                if (duplicates.length > 0) {
                    validationErrors.push(
                        `중복된 장소가 있습니다: ${[...new Set(duplicates)].join(", ")}`
                    );
                }
            }
        }

        // 검증 실패 시 에러 반환
        if (validationErrors.length > 0) {
            console.error("=== AI 응답 검증 실패 ===");
            console.error("검증 오류:", validationErrors);
            console.error("AI 응답:", JSON.stringify(finalPlan, null, 2));
            return NextResponse.json(
                {
                    message: "AI가 생성한 일정이 조건을 만족하지 않습니다. 다시 시도해주세요.",
                    error: "VALIDATION_FAILED",
                    details: validationErrors
                },
                { status: 500 }
            );
        }

        console.log("=== 최종 계획 (검증 통과) ===");
        console.log(JSON.stringify(finalPlan, null, 2));

        return NextResponse.json(finalPlan);
    } catch (error) {
        console.error("AI 추천 생성 중 오류 발생:", error);

        const errorStatus = (error as { status?: number })?.status;

        // 503 Service Unavailable - 모델 과부하
        if (errorStatus === 503) {
            return NextResponse.json(
                {
                    message: "AI 서버가 현재 과부하 상태입니다. 잠시 후 다시 시도해주세요.",
                    error: "SERVICE_UNAVAILABLE",
                    retryAfter: 10 // 초 단위
                },
                { status: 503 }
            );
        }

        // 429 Too Many Requests - 할당량 초과
        if (errorStatus === 429) {
            return NextResponse.json(
                {
                    message: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
                    error: "RATE_LIMIT_EXCEEDED",
                    retryAfter: 60 // 초 단위
                },
                { status: 429 }
            );
        }

        // 500 Internal Server Error
        if (errorStatus === 500) {
            return NextResponse.json(
                {
                    message: "AI 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                    error: "INTERNAL_SERVER_ERROR"
                },
                { status: 500 }
            );
        }

        // 기타 오류
        return NextResponse.json(
            {
                message: "AI 추천 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
                error: "UNKNOWN_ERROR"
            },
            { status: 500 }
        );
    }
}