<<<<<<< HEAD
// app/page.tsx  (URL: /)

import type { TravelSummary } from "@/type/travel";
import { createServerClient } from "@/lib/supabaseClient";
import TravelCard from "@/component/place/TravelCard";

// ⭐️ DB 데이터가 없을 때 사용할 목업 데이터 ⭐️
const MOCK_PLACES: TravelSummary[] = [
  {
    place_id: "jeju-mock-id",
    place_name: "제주도 (Mock)",
    place_image: "https://picsum.photos/400/200?random=1",
    average_rating: 4.8,
  },
  // ⭐️ 누락된 부산 목업 데이터 추가 ⭐️
  {
    place_id: "busan-mock-id",
    place_name: "부산 (Mock)",
    place_image: "https://picsum.photos/400/200?random=2",
    average_rating: 4.5,
  },
  // ⭐️ 누락된 서울 목업 데이터 추가 ⭐️
  {
    place_id: "seoul-mock-id",
    place_name: "서울 (Mock)",
    place_image: "https://picsum.photos/400/200?random=3",
    average_rating: 4.6,
  },
];

// ⭐️ 서버 컴포넌트 이름 변경: Page로 변경 ⭐️
const Page = async () => {
  const fetchPlaces = async (): Promise<TravelSummary[]> => {
    const supabase = createServerClient();

    const { data: dbPlaces, error: dbError } = await supabase
      .from("place")
      .select("place_id, place_name, place_image, average_rating")
      .order("average_rating", { ascending: false });

    if (dbError || !dbPlaces || dbPlaces.length === 0) {
      console.warn("DB 데이터 없음 또는 오류. 목업을 사용합니다.");
      return MOCK_PLACES;
    }

    return dbPlaces as TravelSummary[];
  };

  const places = await fetchPlaces();

  return (
    <div className="travel-app-container">
      <h1>여행지 둘러보기</h1>
      <div className="filter-sort-bar">
        <span>정렬: 최신순 ｜ 별점 높은순</span>
      </div>

      <div
        className="travel-list-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {/* TravelCard는 클라이언트 컴포넌트임 */}
        {places.map((place) => (
          <TravelCard key={place.place_id} place={place} />
        ))}
      </div>
    </div>
  );
};

export default Page;
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
>>>>>>> cd3abab9b149e9f540c0645fbdeb96a005113f6a
