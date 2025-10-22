# Supabase 쿼리 로거

## 📝 개요

개발 환경에서 Supabase 쿼리를 자동으로 로깅하여 실행되는 SQL 문을 터미널에서 확인할 수 있습니다.

## 🚀 사용 방법

### 자동 적용

이미 모든 Supabase 쿼리에 자동으로 적용되어 있습니다. 추가 설정 없이 개발 서버를 실행하면 쿼리 로그를 볼 수 있습니다:

```bash
npm run dev
```

### 쿼리 로그 예시

```
================================================================================
🔍 [Supabase Query] 2025-01-21T10:30:45.123Z
📊 Table: place | Operation: SELECT
📝 Query: SELECT *
FROM place
ORDER BY favorite_count DESC
LIMIT 10
⏱️  Duration: 45ms
================================================================================
```

## 🎯 지원하는 쿼리 메서드

### SELECT 쿼리
- `select()` - 컬럼 선택
- `eq()` - 같음
- `neq()` - 같지 않음
- `gt()` - 초과
- `gte()` - 이상
- `lt()` - 미만
- `lte()` - 이하
- `in()` - 포함
- `not()` - 부정
- `order()` - 정렬
- `limit()` - 제한
- `single()` - 단일 결과

### INSERT 쿼리
- `insert()` - 데이터 삽입

### UPDATE 쿼리
- `update()` - 데이터 수정

### DELETE 쿼리
- `delete()` - 데이터 삭제

## 📂 파일 구조

```
utils/
└── queryLogger.ts          # 쿼리 로깅 유틸리티
lib/
└── supabaseClient.ts       # 로깅이 적용된 Supabase 클라이언트
```

## ⚙️ 설정

### 로깅 활성화/비활성화

로깅은 **개발 환경에서만** 자동으로 활성화됩니다:

- `NODE_ENV === 'development'` → 로깅 활성화 ✅
- `NODE_ENV === 'production'` → 로깅 비활성화 ❌

운영 환경에서는 성능 영향을 최소화하기 위해 자동으로 비활성화됩니다.

### 수동 제어

필요시 `lib/supabaseClient.ts`에서 수동으로 제어할 수 있습니다:

```typescript
// 강제 활성화
const enableQueryLogging = true;

// 강제 비활성화
const enableQueryLogging = false;
```

## 🔍 실제 사용 예시

### 1. 여행지 목록 조회
```typescript
const { data } = await supabase
  .from("place")
  .select("*")
  .order("favorite_count", { ascending: false })
  .limit(10);
```

**터미널 출력:**
```
================================================================================
🔍 [Supabase Query] 2025-01-21T10:30:45.123Z
📊 Table: place | Operation: SELECT
📝 Query: SELECT *
FROM place
ORDER BY favorite_count DESC
LIMIT 10
⏱️  Duration: 45ms
================================================================================
```

### 2. 리뷰 생성
```typescript
const { data } = await supabase
  .from("review")
  .insert({
    user_id: "123",
    place_id: "456",
    rating: 5,
    review_title: "Great place!",
  })
  .select()
  .single();
```

**터미널 출력:**
```
================================================================================
🔍 [Supabase Query] 2025-01-21T10:31:20.456Z
📊 Table: review | Operation: INSERT
📝 Query: INSERT INTO review
VALUES ({
  "user_id": "123",
  "place_id": "456",
  "rating": 5,
  "review_title": "Great place!"
})
LIMIT 1
⏱️  Duration: 78ms
================================================================================
```

### 3. 조건부 업데이트
```typescript
const { data } = await supabase
  .from("user_favorite_place")
  .update({ is_active: true })
  .eq("user_id", userId)
  .eq("place_id", placeId);
```

**터미널 출력:**
```
================================================================================
🔍 [Supabase Query] 2025-01-21T10:32:10.789Z
📊 Table: user_favorite_place | Operation: UPDATE
📝 Query: UPDATE user_favorite_place
SET {
  "is_active": true
}
WHERE user_id = '123'
WHERE place_id = '456'
⏱️  Duration: 32ms
================================================================================
```

## 🐛 디버깅 팁

1. **쿼리가 로그되지 않는 경우**
   - `NODE_ENV`가 'development'인지 확인
   - 개발 서버를 재시작

2. **쿼리 실행 시간 확인**
   - Duration 값으로 성능 병목 지점 파악
   - 100ms 이상 걸리는 쿼리는 최적화 고려

3. **WHERE 조건 확인**
   - 의도한 필터가 올바르게 적용되는지 확인
   - 여러 WHERE 조건이 중복 표시될 수 있음 (체이닝 특성)

## 🎨 로그 커스터마이징

`utils/queryLogger.ts`의 `logQuery` 함수를 수정하여 로그 포맷을 변경할 수 있습니다:

```typescript
const logQuery = (log: QueryLog) => {
  // 여기서 원하는 포맷으로 변경
  console.log(`[${log.operation}] ${log.table}`);
  console.log(log.query);
};
```

## 📊 성능 영향

- 개발 환경: 쿼리당 평균 1-2ms 추가 오버헤드
- 운영 환경: 0ms (로깅 비활성화)

## 🔗 관련 파일

- `utils/queryLogger.ts` - 쿼리 로깅 로직
- `lib/supabaseClient.ts` - 클라이언트 래핑
- `apis/*` - 실제 쿼리 사용 예시
