import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import * as fs from 'fs'

// ES module에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env.local 파일 로드
dotenv.config({ path: resolve(__dirname, '../.env.local') })

// 진행 상황 파일 경로
const PROGRESS_FILE = resolve(__dirname, 'lastProcessedOrder.json')

const TOUR_API_KEY = process.env.TOUR_API_SERVICE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 지역 매핑 테이블
const REGION_MAPPING = [
  { idx: 0, region_id: 1, region_name: "서울특별시" },
  { idx: 1, region_id: 2, region_name: "부산광역시" },
  { idx: 2, region_id: 3, region_name: "대구광역시" },
  { idx: 3, region_id: 4, region_name: "인천광역시" },
  { idx: 4, region_id: 5, region_name: "광주광역시" },
  { idx: 5, region_id: 6, region_name: "대전광역시" },
  { idx: 6, region_id: 7, region_name: "울산광역시" },
  { idx: 7, region_id: 8, region_name: "세종특별자치시" },
  { idx: 8, region_id: 9, region_name: "경기도" },
  { idx: 9, region_id: 10, region_name: "강원도" },
  { idx: 10, region_id: 11, region_name: "충청북도" },
  { idx: 11, region_id: 12, region_name: "충청남도" },
  { idx: 12, region_id: 13, region_name: "전라북도" },
  { idx: 13, region_id: 14, region_name: "전라남도" },
  { idx: 14, region_id: 15, region_name: "경상북도" },
  { idx: 15, region_id: 16, region_name: "경상남도" },
  { idx: 16, region_id: 17, region_name: "제주특별자치도" },
]

// addr1에서 시도명 추출 및 region_id 매핑
function getRegionIdFromAddress(addr1: string): number | null {
  if (!addr1) return null

  // addr1의 첫 번째 공백 전까지가 시도명
  const sidoName = addr1.split(' ')[0]

  // 강원특별자치도 -> 강원도
  let normalizedSido = sidoName
  if (sidoName.includes('강원특별자치도')) {
    normalizedSido = '강원도'
  } else if (sidoName.includes('전북특별자치도') || sidoName.startsWith('전북')) {
    normalizedSido = '전라북도'
  }

  // region_name에서 매칭 찾기
  const region = REGION_MAPPING.find(r => r.region_name === normalizedSido)
  return region ? region.region_id : null
}

// API 1: 위치기반 관광정보조회
async function fetchLocationBasedList(mapX = '126.981106', mapY = '37.568477', radius = '20000', pageNo = 1, numOfRows = 1000) {
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    numOfRows: String(numOfRows),
    pageNo: String(pageNo),
    MobileOS: 'ETC',
    MobileApp: 'BackpacKOR',
    _type: 'json',
    arrange: 'A',
    mapX,
    mapY,
    radius,
  })

  const baseURL = `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?${params.toString()}`

  try {
    const response = await axios.get(baseURL)

    const items = response.data.response?.body?.items?.item || []
    const itemsArray = Array.isArray(items) ? items : (items ? [items] : [])

    return itemsArray
  } catch (error: any) {
    console.error('❌ 위치기반 관광정보조회 API 호출 실패:', error.message)
    if (error.response) {
      console.error('  응답 상태:', error.response.status)
      console.error('  응답 데이터:', JSON.stringify(error.response.data, null, 2))
    }
    return []
  }
}

// API 2: 공통 정보 조회
async function fetchCommonInfo(contentId: string, contentTypeId: string) {
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    MobileOS: 'ETC',
    MobileApp: 'BackpacKOR',
    _type: 'json',
    contentId,
  })

  const baseURL = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?${params.toString()}`

  try {
    const response = await axios.get(baseURL)

    const item = response.data.response?.body?.items?.item
    const overview = Array.isArray(item) ? item[0]?.overview : item?.overview

    if (overview) {
      console.log(`    ✅ overview 있음! (길이: ${overview.length})`)
    }

    return overview || null
  } catch (error: any) {
    console.error(`    ❌ 공통 정보 조회 실패 (contentId: ${contentId}):`, error.message)
    return null
  }
}

// API 3: 서비스분류코드조회
async function fetchCategoryCode(cat1?: string, cat2?: string, cat3?: string) {
  if (!cat1 && !cat2 && !cat3) {
    return null
  }

  // cat3가 있으면 cat3로, 없으면 cat2, 그것도 없으면 cat1으로 조회
  let targetCode = cat3 || cat2 || cat1
  let params: any = {
    serviceKey: TOUR_API_KEY,
    MobileOS: 'ETC',
    MobileApp: 'BackpacKOR',
    _type: 'json',
    numOfRows: '1000',
    pageNo: '1',
  }

  // cat3를 조회하려면 cat1, cat2를 파라미터로 전달
  if (cat3 && cat1 && cat2) {
    params.cat1 = cat1
    params.cat2 = cat2
  } else if (cat2 && cat1) {
    params.cat1 = cat1
  }

  const searchParams = new URLSearchParams(params)
  const baseURL = `https://apis.data.go.kr/B551011/KorService2/categoryCode2?${searchParams.toString()}`

  try {
    const response = await axios.get(baseURL)

    const items = response.data.response?.body?.items?.item || []
    const itemsArray = Array.isArray(items) ? items : (items ? [items] : [])

    const category = itemsArray.find((c: any) => c.code === targetCode)

    return category?.name || null
  } catch (error: any) {
    console.error('    ❌ 서비스분류코드조회 실패:', error.message)
    return null
  }
}

// Supabase에 place 데이터 삽입
async function insertPlace(placeData: any) {
  const { error } = await supabase.from('place').insert([placeData])

  if (error) {
    console.error('❌ DB 삽입 실패:', error.message)
    return false
  }
  return true
}

// 기존 place 데이터 확인 (경산향교 이후 데이터 찾기)
async function getExistingPlaces() {
  const { data, error } = await supabase
    .from('place')
    .select('place_name')

  if (error) {
    console.error('❌ 기존 데이터 조회 실패:', error.message)
    return []
  }

  return data || []
}

// 마지막 처리 위치 읽기
function getLastProcessedOrder(regionName: string): { page: number; lastOrder: number; mapX: number; mapY: number } {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
      const region = data.find((r: any) => r.region_name === regionName)
      if (region) {
        return {
          page: region.page || 1,
          lastOrder: region.lastOrder || 0,
          mapX: region.mapX,
          mapY: region.mapY
        }
      }
    }
  } catch (error) {
    console.error('⚠️  진행 상황 파일 읽기 실패:', error)
  }
  return { page: 1, lastOrder: 0, mapX: 0, mapY: 0 }
}

// 마지막 처리 위치 저장
function saveLastProcessedOrder(regionName: string, order: number, page: number) {
  try {
    let data = []
    if (fs.existsSync(PROGRESS_FILE)) {
      data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    }

    const regionIndex = data.findIndex((r: any) => r.region_name === regionName)
    if (regionIndex !== -1) {
      data[regionIndex].lastOrder = order
      data[regionIndex].page = page
      data[regionIndex].timestamp = new Date().toISOString()
    }

    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2))
    console.log(`📝 진행 상황 저장: ${regionName} - page ${page}, jsonOrder ${order}`)
  } catch (error) {
    console.error('❌ 진행 상황 저장 실패:', error)
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Tour API 데이터 삽입 시작...\n')

  // 처리할 지역 설정
  const TARGET_REGION = '경기남부'

  // 1. 마지막 처리 위치 확인
  const regionProgress = getLastProcessedOrder(TARGET_REGION)
  console.log(`📌 지역: ${TARGET_REGION}`)
  console.log(`📌 마지막 처리 위치: page ${regionProgress.page}, jsonOrder ${regionProgress.lastOrder}`)
  console.log(`🎯 다음 처리할 위치: jsonOrder ${regionProgress.lastOrder + 1}`)
  console.log(`🚀 대량 삽입 모드: 3000개 처리합니다.\n`)

  // 2. 기존 데이터 확인
  const existingPlaces = await getExistingPlaces()
  const placeNames = existingPlaces.map(p => p.place_name)
  console.log(`📊 기존 place 데이터 개수: ${placeNames.length}`)

  // 3. 위치기반 관광정보조회로 데이터 가져오기 (제주도 중심, 페이지 1, 3000개)
  console.log(`\n📍 위치기반 관광정보조회 API 호출 중... (${TARGET_REGION}, 페이지 ${regionProgress.page}, 3000개)`)
  const locations = await fetchLocationBasedList(
    String(regionProgress.mapX),
    String(regionProgress.mapY),
    '50000',
    regionProgress.page,
    3000
  )

  if (locations.length === 0) {
    console.log('⚠️  데이터 없음')
    return
  }

  console.log(`✅ ${locations.length}개 데이터 가져옴\n`)

  // 4. 데이터 처리 (lastOrder + 1부터 시작, 전체 처리)
  let processedCount = 0
  let skippedCount = 0
  const targetInsertCount = locations.length // 🎯 전체 삽입

  for (let jsonOrder = regionProgress.lastOrder + 1; jsonOrder <= locations.length; jsonOrder++) {
    const location = locations[jsonOrder - 1] // 배열은 0부터 시작
    if (!location) {
      console.log(`⚠️  jsonOrder ${jsonOrder}: 데이터 없음 (배열 범위 초과)`)
      break
    }

    const title = location.title

    // 이미 존재하는 데이터는 스킵
    if (placeNames.includes(title)) {
      console.log(`⏭️  스킵 [${jsonOrder}]: ${title} (이미 존재)`)
      skippedCount++
      // 진행 상황은 저장
      saveLastProcessedOrder(TARGET_REGION, jsonOrder, regionProgress.page)
      continue
    }

    // 이미지가 없는 경우 스킵
    if (!location.firstimage) {
      console.log(`⏭️  스킵 [${jsonOrder}]: ${title} (이미지 없음)`)
      skippedCount++
      // 진행 상황은 저장
      saveLastProcessedOrder(TARGET_REGION, jsonOrder, regionProgress.page)
      continue
    }

    // 🎯 1개 삽입 완료 시 종료
    if (processedCount >= targetInsertCount) {
      console.log(`\n✅ 목표 달성! ${targetInsertCount}개 삽입 완료`)
      break
    }

    console.log(`\n🔍 처리 중 [jsonOrder: ${jsonOrder}]: ${title}`)

    // 4. 공통 정보 조회로 overview 가져오기
    const overview = await fetchCommonInfo(location.contentid, location.contenttypeid)
    console.log(`  - overview: ${overview ? '존재함' : 'null'}`)

    // 5. 서비스분류코드조회로 카테고리 가져오기
    const category = await fetchCategoryCode(location.cat1, location.cat2, location.cat3)
    console.log(`  - category: ${category || 'null'}`)

    // 6. region_id 매핑
    const regionId = getRegionIdFromAddress(location.addr1)
    console.log(`  - addr1: ${location.addr1}`)
    console.log(`  - region_id: ${regionId}`)

    // 7. place 데이터 구성
    const placeData = {
      place_name: title,
      place_address: location.addr1 || null,
      place_description: overview,
      place_image: location.firstimage || null,
      average_rating: 0,
      favorite_count: 0,
      region_id: regionId,
      place_category: category,
      latitude: location.mapy ? parseFloat(location.mapy) : null,
      longitude: location.mapx ? parseFloat(location.mapx) : null,
    }

    console.log('\n📦 삽입할 데이터:')
    console.log(JSON.stringify(placeData, null, 2))

    // 8. DB 삽입
    const success = await insertPlace(placeData)
    if (success) {
      console.log(`\n✅ "${title}" 삽입 완료!`)

      // 진행 상황 저장
      saveLastProcessedOrder(TARGET_REGION, jsonOrder, regionProgress.page)

      processedCount++
    }

    // API 호출 제한 방지 (0.5초 대기)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // 최종 통계
  const finalProgress = getLastProcessedOrder(TARGET_REGION)
  console.log('\n' + '='.repeat(60))
  console.log(`📊 처리 완료 통계:`)
  console.log(`  - 지역: ${TARGET_REGION}`)
  console.log(`  - 총 처리: ${processedCount}개 삽입`)
  console.log(`  - 스킵: ${skippedCount}개`)
  console.log(`  - 현재 진행: page ${finalProgress.page}, jsonOrder ${finalProgress.lastOrder}`)
  console.log('='.repeat(60))

  if (processedCount > 0) {
    console.log('\n✅ 테스트 삽입 완료! 데이터를 확인해주세요.')
    console.log(`💡 다음 실행 시 jsonOrder ${finalProgress.lastOrder + 1}부터 시작됩니다.`)
  } else {
    console.log('\n⚠️  삽입된 데이터가 없습니다.')
    console.log(`   현재 위치: page ${finalProgress.page}, jsonOrder ${finalProgress.lastOrder}`)
    console.log(`   다시 실행하면 jsonOrder ${finalProgress.lastOrder + 1}부터 시도합니다.`)
  }
}

main()
