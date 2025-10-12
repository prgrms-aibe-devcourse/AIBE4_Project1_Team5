// component/planner/PlannerEditor.tsx 새로운 여행 일정을 생성하거나 기존 일정을 수정하는 일정편집 페이지 컴포넌트
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { differenceInDays, format, addDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from '@/component/planner/SortableItem';
import type { Place } from '@/app/planner/edit/page';
import { createBrowserClient } from '@/lib/supabaseClient';

// --- 데이터 타입 정의 ---
interface DayInfo {
    day: number;
    date: string;
}
type Plan = Record<number, Place[]>;

interface TripPlanDetail {
    place: Place;
    day_number: number;
}

interface PlannerEditorProps {
    initialPlaces: Place[];
}

export default function PlannerEditor({ initialPlaces }: PlannerEditorProps) {
    // --- Hooks ---
    const supabase = createBrowserClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- URL 파라미터 읽기 ---
    const tripIdToEdit = searchParams.get('trip_id');
    const startDateStr = searchParams.get('start');
    const endDateStr = searchParams.get('end');

    // --- 상태 (State) ---
    const [places] = useState<Place[]>(initialPlaces);
    const [plan, setPlan] = useState<Plan>({});
    const [activeDay, setActiveDay] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);
    const [tripTitle, setTripTitle] = useState("나만의 새로운 여행");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true); // [추가] 데이터 로딩 상태 추가

    // --- Effects ---
    useEffect(() => {
        const fetchPlanData = async () => {
            if (!tripIdToEdit) {
                setIsLoading(false);
                return;
            }

            // 1. 기본 정보 (제목) 가져오기
            const { data: planData, error: planError } = await supabase
                .from('trip_plan')
                .select('trip_title')
                .eq('trip_id', tripIdToEdit)
                .single();

            if (planData) setTripTitle(planData.trip_title);

            // 2. 상세 일정 정보 가져오기
            const { data: details, error: detailsError } = await supabase
                .from('trip_plan_detail')
                .select('day_number, place(*)')
                .eq('trip_id', tripIdToEdit);

            if (planError || detailsError) {
                alert("기존 일정 정보를 불러오는 데 실패했습니다.");
                setIsLoading(false);
                return;
            }

            // 3. 불러온 데이터로 plan 상태 채우기
            const newPlan: Plan = {};
            // forEach 내부의 detail 타입을 any로 지정합니다.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (details || []).forEach((detail: any) => {
                if (!newPlan[detail.day_number]) {
                    newPlan[detail.day_number] = [];
                }
                newPlan[detail.day_number].push(detail.place);
            });
            setPlan(newPlan);
            setIsLoading(false); // 로딩 완료
        };

        fetchPlanData();
    }, [tripIdToEdit]);

    // --- 데이터 가공 ---
    let days: DayInfo[] = [];
    if (startDateStr && endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        const duration = differenceInDays(end, start) + 1;
        days = Array.from({ length: duration }, (_, i) => ({ day: i + 1, date: format(addDays(start, i), 'yyyy. MM. dd') }));
    }

    const filteredPlaces = places.filter(place =>
        place.place_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- 핸들러 함수 ---
    const handleAddPlace = (place: Place) => {
        setPlan(prevPlan => ({...prevPlan, [activeDay]: [...(prevPlan[activeDay] || []), place] }));
    };

    const handleRemovePlace = (day: number, placeId: string) => {
        setPlan(prevPlan => ({ ...prevPlan, [day]: prevPlan[day].filter((p) => p.place_id !== placeId) }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPlan(prevPlan => {
                const activeDayPlaces = prevPlan[activeDay] || [];
                const oldIndex = activeDayPlaces.findIndex(p => p.place_id === active.id);
                const newIndex = activeDayPlaces.findIndex(p => p.place_id === over.id);
                return { ...prevPlan, [activeDay]: arrayMove(activeDayPlaces, oldIndex, newIndex) };
            });
        }
    };

    const handleSavePlan = async () => {
        setIsSaving(true);
        const testUserId = '2770999e-5675-49d3-8cd4-e4fc5984699a'; // TODO: 로그인 기능 완성 후 실제 유저 ID로 변경

        if (tripIdToEdit) {
            // --- 수정 로직 ---
            await supabase.from('trip_plan').update({ trip_title: tripTitle }).eq('trip_id', tripIdToEdit);
            await supabase.from('trip_plan_detail').delete().eq('trip_id', tripIdToEdit);

            const newPlanDetails = Object.entries(plan).flatMap(([day, places]) =>
                places.map((p, i) => ({ trip_id: tripIdToEdit, place_id: p.place_id, day_number: parseInt(day), visit_order: i + 1 }))
            );

            if (newPlanDetails.length > 0) {
                await supabase.from('trip_plan_detail').insert(newPlanDetails);
            }
            alert("일정이 수정되었습니다.");
            router.push(`/my-page/${tripIdToEdit}`);
        } else {
            // --- 생성 로직 ---
            const { data: insertedPlan, error: planError } = await supabase.from('trip_plan').insert({
                user_id: testUserId, trip_title: tripTitle, trip_start_date: startDateStr, trip_end_date: endDateStr
            }).select('trip_id').single();

            if (planError || !insertedPlan) { /* ...에러 처리... */ }
            else {
                const planDetails = Object.entries(plan).flatMap(([day, places]) =>
                    places.map((p, i) => ({ trip_id: insertedPlan.trip_id, place_id: p.place_id, day_number: parseInt(day), visit_order: i + 1 }))
                );
                if (planDetails.length > 0) {
                    await supabase.from('trip_plan_detail').insert(planDetails);
                }
                alert("일정이 저장되었습니다.");
                router.push('/my-page');
            }
        }
        setIsSaving(false);
    };

    // 로딩 중일 때 화면
    if (isLoading && tripIdToEdit) {
        return <div className="w-full h-screen flex items-center justify-center">기존 일정 정보를 불러오는 중...</div>;
    }

    // --- 렌더링 (JSX) ---
    return (
        <div className="w-full h-screen flex flex-col p-4 bg-gray-50">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{tripIdToEdit ? '여행 일정 수정' : '나만의 여행 만들기'}</h1>
                <button onClick={handleSavePlan} disabled={isSaving} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                    {isSaving ? '저장 중...' : '이 일정 저장하기'}
                </button>
            </header>

            <main className="flex-grow flex gap-4 overflow-hidden">
                <section className="w-1/2 h-full bg-white rounded-lg p-4 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        {isEditingTitle ? (
                            <input type="text" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }} className="text-lg font-bold p-1 border-b-2 border-blue-500 focus:outline-none" autoFocus />
                        ) : (<h2 className="font-bold text-lg">🗓️ {tripTitle}</h2>)}
                        <button onClick={() => setIsEditingTitle(!isEditingTitle)} className="text-lg">{isEditingTitle ? '✔' : '✏️'}</button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{startDateStr} ~ {endDateStr}</p>
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {days.map((dayInfo) => (
                            <div key={dayInfo.day} onClick={() => setActiveDay(dayInfo.day)} className={`p-4 rounded-md border cursor-pointer ${activeDay === dayInfo.day ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'}`}>
                                <h3 className="font-bold">Day {dayInfo.day}</h3>
                                <p className="text-sm text-gray-400">{dayInfo.date}</p>
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={(plan[dayInfo.day] || []).map(p => p.place_id)} strategy={verticalListSortingStrategy}>
                                        <div className="mt-2 space-y-2">
                                            {(plan[dayInfo.day] || []).map((place) => (
                                                <SortableItem key={place.place_id} place={place} onRemove={() => handleRemovePlace(dayInfo.day, place.place_id)} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="w-1/2 h-full bg-white rounded-lg p-4 shadow-sm flex flex-col overflow-hidden">
                    <h2 className="font-bold text-lg mb-4">📍 여행지 둘러보기</h2>
                    <input type="text" placeholder="어디로 떠나고 싶으신가요?" className="w-full p-2 border rounded-md mb-4" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                        {filteredPlaces.map((place) => (
                            <div key={place.place_id} className="flex items-center gap-4 p-2 border rounded-md bg-gray-50">
                                <img src={place.place_image} alt={place.place_name} className="w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow"><h4 className="font-bold">{place.place_name}</h4></div>
                                <button onClick={() => handleAddPlace(place)} className="px-3 py-1 bg-white border border-blue-500 text-blue-500 text-sm font-semibold rounded-md hover:bg-blue-50">추가</button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}