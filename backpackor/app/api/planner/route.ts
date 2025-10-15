import { createServerClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;

    // 1. 사용자 입력 정보 수집
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const regionName = searchParams.get("region");
    const companion = searchParams.get("companion");
    const styles = searchParams.getAll("style");
    const speed = searchParams.get("speed");
    const transport = searchParams.getAll("transport");

    // 지역 정보가 없으면 에러를 반환합니다.
    if (!regionName) {
      return NextResponse.json(
        { message: "지역이 선택되지 않았습니다." },
        { status: 400 }
      );
    }

    // const { data: places, error: placesError } = await supabase
    //     .from('place')
    //     .select('place_name')

    // 2. 선택된 지역의 장소 목록만 DB에서 가져옵니다.
    const { data: places, error: placesError } = await supabase
      .from("place")
      .select(
        `
                place_name,
                region!inner(region_name)
            `
      )
      .eq("region.region_name", regionName); // region 테이블과 조인하여 필터링

    if (placesError || !places || places.length === 0) {
      throw new Error(
        `DB에서 '${regionName}' 지역의 장소 목록을 가져오는 데 실패했습니다.`
      );
    }
    const availablePlaces = places.map((p) => p.place_name);

    // + 여행 속도(speed)에 따라 추천 장소 개수를 결정
    let placeCountInstruction =
      "날짜별로 여행 속도에 맞게 3~4개의 장소를 추천해주세요."; // 기본값
    if (speed === "relaxed") {
      placeCountInstruction = "날짜별로 1~2개의 장소만 추천해주세요.";
    } else if (speed === "packed") {
      placeCountInstruction = "날짜별로 5개의 장소를 꽉 채워서 추천해주세요.";
    }

    // 3. 프롬프트 생성
    const prompt = `
            - 여행지: ${regionName}
            - 여행 기간: ${start} ~ ${end}
            - 동행: ${companion}
            - 여행 스타일: ${styles.join(", ")}
            - 여행 속도: ${speed}
            - 주요 이동 수단: ${transport.join(", ")}
            - 반드시 다음 장소 목록 안에서만 장소를 선택해야 합니다: [${availablePlaces.join(
              ", "
            )}]
        `;

    const systemInstruction = `
            당신은 최고의 여행 플래너입니다.
            전달받는 조건에 맞는 여행 계획을 짜주세요.
            여행 제목은 조건에 맞게 창의적으로 25자 이내로 만들어주세요.
            결과는 반드시 아래와 같은 JSON 형식으로만 응답해야 하며, 다른 설명은 절대 추가하지 마세요.
            ${placeCountInstruction}
            - 각 여행지는 전체 일정 내에서 단 한 번만 추천해야 합니다.
            - plan 객체의 key는 반드시 1부터 시작하는 순서대로 된 숫자여야 합니다. (예: "1", "2", "3", ...)
            JSON 형식 예시: {"title": "부산 힐링 & 맛집 탐방", "plan": {"1": [{"place_name": "감천문화마을"}], "2": [{"place_name": "해운대해수욕장"}]}}
        `;

    console.log("=============== 🚀 AI에게 보내는 내용 ================");
    console.log("System Instruction:", systemInstruction);
    console.log("Prompt:", prompt);
    console.log("======================================================");

    const geminiModel = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
    const apiKey = process.env.GEMINI_API_KEY;

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API 에러 응답:", errorBody);
      throw new Error(`Gemini API 호출 실패: ${response.statusText}`);
    }

    let aiResponseText = (await response.json()).candidates[0].content.parts[0]
      .text;

    console.log("=============== 🎁 AI가 보낸 원본 응답 ===============");
    console.log(aiResponseText);
    console.log("======================================================");

    if (aiResponseText.startsWith("```json")) {
      aiResponseText = aiResponseText
        .substring(7, aiResponseText.length - 3)
        .trim();
    }

    const finalPlan = JSON.parse(aiResponseText);
    return NextResponse.json(finalPlan);
  } catch (error) {
    console.error("AI 추천 생성 중 오류 발생:", error);
    return NextResponse.json(
      { message: "AI 추천 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
