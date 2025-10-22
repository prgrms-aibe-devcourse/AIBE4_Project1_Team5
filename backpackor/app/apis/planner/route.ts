// [수정] Google AI SDK를 사용하기 위해 필요한 모듈을 import 합니다.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

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

        // 2. 스타일에 따른 카테고리 매핑
        const categoryMapping: Record<string, string[]> = {
            nature: ["자연명소", "휴양림", "식물원"],
            beach: ["해수욕장"],
            hotspring: ["온천지역"],
            culture: ["문화재", "드라마/영화촬영지"],
            festival: ["지역축제"],
            activity: ["체험형", "캠핑장/야영장"],
            theme: ["테마공원", "동물원", "아쿠아리움"],
            shopping: ["먹거리/패션거리"],
            attraction: ["관광지"],
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

        if (placesError || !places || places.length === 0) {
            throw new Error(
                `DB에서 '${regionName}' 지역의 장소 목록을 가져오는 데 실패했습니다.`
            );
        }
        const availablePlaces = places.map((p) => p.place_name);

        // 4. 날짜별 일수 계산
        const startDateObj = new Date(start!);
        const endDateObj = new Date(end!);
        const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        let placeCountInstruction = "";
        let minPlaces = 3;
        let maxPlaces = 4;

        if (speed === "relaxed") {
            minPlaces = 1;
            maxPlaces = 2;
            placeCountInstruction = `각 날짜마다 정확히 ${minPlaces}~${maxPlaces}개의 장소를 추천해야 합니다. 절대로 ${maxPlaces}개를 초과하거나 ${minPlaces}개 미만으로 추천하지 마세요.`;
        } else if (speed === "packed") {
            minPlaces = 5;
            maxPlaces = 6;
            placeCountInstruction = `각 날짜마다 정확히 ${minPlaces}~${maxPlaces}개의 장소를 추천해야 합니다. 절대로 ${maxPlaces}개를 초과하거나 ${minPlaces}개 미만으로 추천하지 마세요.`;
        } else {
            placeCountInstruction = `각 날짜마다 정확히 ${minPlaces}~${maxPlaces}개의 장소를 추천해야 합니다. 절대로 ${maxPlaces}개를 초과하거나 ${minPlaces}개 미만으로 추천하지 마세요.`;
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

        // 7. 프롬프트 생성
        const prompt = `
다음 조건에 맞는 ${daysDiff}일간의 여행 일정을 만들어주세요:

여행 정보:
- 지역: ${regionName}
- 기간: ${start} ~ ${end} (총 ${daysDiff}일)
- 동행: ${companion} - ${companionContext[companion!] || ""}
- 선호 스타일: ${styles.join(", ")}
- 여행 템포: ${speed}
- ${transportContext}

중요 제약사항:
1. ${placeCountInstruction}
2. 다음 장소 목록에서만 선택하세요: ${availablePlaces.join(", ")}
3. 각 장소는 전체 일정에서 단 한 번만 사용하세요.
4. 모든 날짜(1일차부터 ${daysDiff}일차까지)에 대해 일정을 작성하세요.
5. 장소 간 이동 동선을 고려하여 효율적으로 배치하세요.

응답 형식:
{"title": "여행 제목 (25자 이내)", "plan": {"1": [{"place_name": "장소명"}], "2": [{"place_name": "장소명"}]}}
`;

        const systemInstruction = `
당신은 전문 여행 플래너 AI입니다. 주어진 조건을 철저히 준수하여 여행 일정을 만들어야 합니다.

핵심 규칙:
1. ${placeCountInstruction}
2. 반드시 제공된 장소 목록에서만 선택하세요.
3. 중복 없이 각 장소는 한 번만 사용하세요.
4. plan 객체의 키는 "1", "2", "3" 등 순서대로 된 숫자 문자열이어야 합니다.
5. 순수 JSON만 출력하고, 다른 설명이나 마크다운 코드 블록을 추가하지 마세요.
6. 모든 날짜에 대해 빠짐없이 일정을 작성하세요.

출력 예시:
{"title": "부산 힐링 & 맛집 탐방", "plan": {"1": [{"place_name": "감천문화마을"}, {"place_name": "송도해수욕장"}], "2": [{"place_name": "해운대해수욕장"}, {"place_name": "광안리해수욕장"}]}}
`;

        // 8. AI에게 요청
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        console.log("=== AI 요청 시작 ===");
        console.log("지역:", regionName);
        console.log("선택된 카테고리:", selectedCategories);
        console.log("사용 가능한 장소 수:", availablePlaces.length);
        console.log("여행 일수:", daysDiff);

        const result = await model.generateContent(prompt);
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

        // JSON 파싱 시도
        let finalPlan;
        try {
            finalPlan = JSON.parse(aiResponseText);
        } catch (parseError) {
            console.error("JSON 파싱 실패:", parseError);
            console.error("파싱 시도한 텍스트:", aiResponseText);
            throw new Error("AI 응답을 JSON으로 파싱하는데 실패했습니다.");
        }

        console.log("=== 최종 계획 ===");
        console.log(JSON.stringify(finalPlan, null, 2));

        return NextResponse.json(finalPlan);
    } catch (error) {
        console.error("AI 추천 생성 중 오류 발생:", error);
        return NextResponse.json(
            { message: "AI 추천 생성 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}