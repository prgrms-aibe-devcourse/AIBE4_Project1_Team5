// app/planner/edit/page.tsx

import { createServerClient } from "@/lib/supabaseClient";
import PlannerEditor from "@/component/planner/PlannerEditor";

export interface Place {
    place_id: string;
    place_name: string;
    place_image: string;
}

export default async function EditPlannerPage() {
    const supabase = createServerClient();
    const { data: places, error } = await supabase.from('place').select('place_id, place_name, place_image');

    if (error) {
        console.error("데이터를 불러오는 데 실패했습니다:", error);
        return <div>에러가 발생했습니다.</div>;
    }

    return <PlannerEditor initialPlaces={places as Place[]} />;
}