// app/page.tsx
import type { TravelSummary } from "@/type/travel";
import { createServerClient } from "@/lib/supabaseClient";
import PlacesList from "@/component/place/PlacesList";
import styles from "./HomePage.module.css";

const Page = async () => {
  const supabase = createServerClient();
  const { data: dbPlaces, error } = await supabase
    .from("place")
    .select("place_id, place_name, place_image, average_rating")
    .order("average_rating", { ascending: false })
    .limit(6);

  const initial: TravelSummary[] = (dbPlaces ?? []).map((p) => ({
    place_id: p.place_id,
    place_name: p.place_name,
    place_image: p.place_image,
    average_rating: p.average_rating,
  }));

  return (
    <main className={styles["main-content"]}>
      <section className={styles["hero-section"]}>
        <h1>어디로 떠나볼까요?</h1>
        <p>새로운 여행지를 발견하고 여행을 계획해보세요.</p>
        <div className={styles["search-bar"]}>
          <input type="text" placeholder="어디로 떠나고 싶으신가요?" />
        </div>
      </section>

      <section className={styles["travel-section"]}>
        <h2>인기 여행지</h2>
        {/* 초기 6개 + 더보기 로드 */}
        <PlacesList initial={initial} />
      </section>
    </main>
  );
};

export default Page;
