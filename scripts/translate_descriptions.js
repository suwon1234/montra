/**
 * translate_descriptions.js
 *
 * Reads trends_v6_verified.sql and replaces all English descriptions
 * with Korean translations. Outputs trends_v6_korean.sql.
 *
 * Total: 105 unique descriptions (86 with NULL name_local + 19 with non-NULL name_local or escaped quotes)
 * 2,751 INSERT statements total
 */

const fs = require('fs');
const path = require('path');

// English -> Korean mapping
// Key = exact description string as it appears in SQL (with '' for escaped quotes)
const descMap = {
  // === Global viral (14 core trends) ===
  "TikTok global viral memory challenge. Players must answer within 10 seconds. Couples/friends videos with millions of views.":
    "틱톡에서 #The10Game 메모리 챌린지 글로벌 바이럴. 10초 안에 답해야 하는 규칙으로 커플/친구 영상 수백만 조회수 기록.",

  "TikTok viral challenge where participants form a square shape with their arms. Spread globally within 16 hours.":
    "틱톡에서 #SquareUp 팔로 사각형 만들기 챌린지 바이럴. 16시간 만에 글로벌 확산.",

  "TikTok Gen Z self-expression trend. Global viral challenge for personal identity content.":
    "틱톡에서 #YoungHo Z세대 자기표현 트렌드 글로벌 바이럴. 개인 정체성 콘텐츠 챌린지.",

  "TikTok before vs after transformation challenge. Global viral with beauty/fashion makeover videos.":
    "틱톡에서 #GlowUp 비포/애프터 변신 챌린지 글로벌 바이럴. 뷰티/패션 메이크오버 영상.",

  "TikTok viral recipe: cream cheese + dill pickle dip. Originated in US (Super Bowl), spread globally.":
    "틱톡에서 크림치즈+딜피클 딥 레시피 바이럴. 미국 슈퍼볼 간식으로 시작해 글로벌 확산.",

  "TikTok viral recipe: Greek yogurt + Biscoff only. Simple 2-ingredient Japanese-style cheesecake.":
    "틱톡에서 그릭요거트+비스코프 2재료 일본식 치즈케이크 레시피 바이럴. 초간단 레시피로 화제.",

  "TikTok viral pistachio trend: croissants, brownies, cookies, ice cream. 2026 ingredient of the year.":
    "틱톡에서 피스타치오 트렌드 바이럴. 크루아상, 브라우니, 쿠키, 아이스크림 등. 2026 올해의 식재료.",

  "TikTok viral cognitive health coffee alternative. Mushroom extract blended coffee for wellness.":
    "틱톡에서 버섯 커피 웰니스 트렌드 바이럴. 인지건강용 버섯 추출물 블렌딩 커피 대안.",

  "TikTok viral room decor. $15 star projector with 10K+ orders. Room makeover essential.":
    "틱톡에서 $15 LED 갤럭시 프로젝터 방 꾸미기 영상 바이럴. 10,000건 이상 주문. 룸 메이크오버 필수템.",

  "TikTok viral ASMR product. DIY rolled ice cream at home. Satisfying content with millions of views.":
    "틱톡에서 롤링 아이스크림 팬 ASMR 콘텐츠 바이럴. 집에서 DIY 롤 아이스크림 만들기. 수백만 조회수.",

  "TikTok viral magnetic ball game. 100K+ units sold. Satisfying desk toy content.":
    "틱톡에서 Kollide 자석 볼 게임 바이럴. 10만 개 이상 판매. 데스크 토이 만족감 콘텐츠.",

  "TikTok viral before/after pet hair removal content. Dramatic results on furniture and clothes.":
    "틱톡에서 펫 헤어 롤러 비포/애프터 콘텐츠 바이럴. 가구와 옷에서 극적인 털 제거 효과.",

  "Harry Styles album released 3/6. TikTok GRWM and dance content viral globally.":
    "Harry Styles 앨범 3/6 발매. 틱톡에서 GRWM 및 댄스 콘텐츠 글로벌 바이럴.",

  "TikTok viral UK-originated food challenge turned fashion trend. Greaseproof paper wrap styling.":
    "틱톡에서 영국발 푸드 챌린지가 패션 트렌드로 전환 바이럴. 기름종이 랩 스타일링.",

  // === UAE/Saudi specific ===
  "TikTok viral UAE perfume brand Gissah. Middle Eastern luxury fragrance trending.":
    "틱톡에서 UAE 럭셔리 향수 브랜드 Gissah 바이럴. 중동 프리미엄 프래그런스 트렌딩.",

  "TikTok viral UAE beauty brand Her Magic. Middle Eastern beauty market.":
    "틱톡에서 UAE 뷰티 브랜드 Her Magic 바이럴. 중동 뷰티 시장 트렌딩.",

  "TikTok modest luxury fashion trend viral in UAE. High-end modest wear.":
    "틱톡에서 UAE 모디스트 럭셔리 패션 트렌드 바이럴. 하이엔드 모디스트 웨어.",

  "TikTok viral perfume brand Gissah also trending in Saudi Arabia. Luxury fragrance.":
    "틱톡에서 향수 브랜드 Gissah 사우디아라비아에서도 트렌딩 바이럴. 럭셔리 프래그런스.",

  "TikTok modest luxury fashion trend in Saudi Arabia. High-end modest wear.":
    "틱톡에서 사우디아라비아 모디스트 럭셔리 패션 트렌드 바이럴. 하이엔드 모디스트 웨어.",

  // === UK specific ===
  "TikTok UK viral fakeaway doner kebab recipe. Greaseproof paper wrapping is the key trick.":
    "틱톡에서 영국 Fakeaway 되너케밥 레시피 바이럴. 기름종이 랩핑이 핵심 트릭.",

  "TikTok wabi-sabi aesthetic trend viral in UK. Imperfect beauty, natural textures.":
    "틱톡에서 영국 와비사비 미학 트렌드 바이럴. 불완전한 아름다움, 자연스러운 텍스처.",

  // === TikTok Shop Europe ===
  "TikTok Shop UK bestseller. Dr. Melaxin EUR911K actual sales on TikTok Shop.":
    "틱톡샵 UK 베스트셀러. Dr. Melaxin 실제 매출 91.1만 유로.",

  "TikTok Shop UK. DRDENT EUR689K actual sales. Dental care viral.":
    "틱톡샵 UK. DRDENT 실제 매출 68.9만 유로. 치과 관리 바이럴.",

  "TikTok Shop UK. UMAY Treadmill EUR734K actual sales. Home fitness viral.":
    "틱톡샵 UK. UMAY 트레드밀 실제 매출 73.4만 유로. 홈 피트니스 바이럴.",

  "TikTok Shop Germany bestseller. Baby stroller EUR873K actual sales.":
    "틱톡샵 독일 베스트셀러. 유모차 실제 매출 87.3만 유로.",

  "TikTok Shop Germany. JONR Vacuum EUR541K actual sales. Home cleaning viral.":
    "틱톡샵 독일. JONR 진공청소기 실제 매출 54.1만 유로. 홈 클리닝 바이럴.",

  "TikTok Shop Germany. Philips OneBlade EUR170K actual sales. Grooming viral.":
    "틱톡샵 독일. Philips OneBlade 실제 매출 17만 유로. 그루밍 바이럴.",

  "TikTok Shop France. DRDENT EUR127K actual sales. Dental care.":
    "틱톡샵 프랑스. DRDENT 실제 매출 12.7만 유로. 치과 관리.",

  "TikTok Shop France. Moulinex Airfryer EUR362K actual sales.":
    "틱톡샵 프랑스. Moulinex 에어프라이어 실제 매출 36.2만 유로.",

  "TikTok Shop Italy. Faux fur coat EUR71K actual sales. Winter fashion viral.":
    "틱톡샵 이탈리아. 인조 퍼 코트 실제 매출 7.1만 유로. 겨울 패션 바이럴.",

  "TikTok Shop Italy. JONR Vacuum EUR295K actual sales.":
    "틱톡샵 이탈리아. JONR 진공청소기 실제 매출 29.5만 유로.",

  "TikTok Shop Spain. Foldable drying rack EUR138K actual sales. Home hack viral.":
    "틱톡샵 스페인. 접이식 건조대 실제 매출 13.8만 유로. 홈 핵 바이럴.",

  "TikTok Shop Spain. Vitalis NAD+ EUR147K actual sales. Wellness supplement viral.":
    "틱톡샵 스페인. Vitalis NAD+ 실제 매출 14.7만 유로. 웰니스 보충제 바이럴.",

  // === France specific ===
  "Catrice entering TikTok Shop France. Drugstore beauty brand expanding.":
    "틱톡에서 Catrice 틱톡샵 프랑스 진출 바이럴. 드럭스토어 뷰티 브랜드 확장.",

  "NIVEA entering TikTok Shop France. Classic skincare brand digital expansion.":
    "틱톡에서 NIVEA 틱톡샵 프랑스 진출 바이럴. 클래식 스킨케어 브랜드 디지털 확장.",

  "essence cosmetics entering TikTok Shop France. Affordable beauty trend.":
    "틱톡에서 essence cosmetics 틱톡샵 프랑스 진출 바이럴. 저가 뷰티 트렌드.",

  "French TikTok creator viral. Major French-language TikTok influencer.":
    "틱톡에서 프랑스 크리에이터 바이럴. 프랑스어권 주요 틱톡 인플루언서.",

  // === Germany specific ===
  "German local TikTok viral brand. Halal sweets niche market leader.":
    "틱톡에서 독일 로컬 브랜드 바이럴. 할랄 스위트 니치 시장 리더.",

  // === Italy specific ===
  "Salerno-based Italian TikTok creator viral. Fashion/lifestyle content.":
    "틱톡에서 이탈리아 살레르노 기반 크리에이터 바이럴. 패션/라이프스타일 콘텐츠.",

  // === Spain specific ===
  "Spanish TikTok gluten-free food creator viral. Health food content.":
    "틱톡에서 스페인 글루텐프리 푸드 크리에이터 바이럴. 건강식 콘텐츠.",

  // === K-Beauty ===
  "K-Beauty brand viral on TikTok. Glassy lip products trending. Olive Young bestseller.":
    "틱톡에서 K-뷰티 브랜드 바이럴. 글래시 립 제품 트렌딩. 올리브영 베스트셀러.",

  "TikTok viral K-Beauty brand. Kill Cover foundation globally expanding. Olive Young.":
    "틱톡에서 K-뷰티 브랜드 Kill Cover 파운데이션 글로벌 확장 바이럴. 올리브영.",

  // === Global Beauty Brands ===
  "TikTok #FentyBeauty Rihanna beauty brand viral. Global beauty trend. Sephora.":
    "틱톡에서 #FentyBeauty 리한나 뷰티 브랜드 바이럴. 글로벌 뷰티 트렌드. 세포라.",

  "TikTok #RhodeSkin Hailey Bieber beauty brand viral. Lip peptide trend. Rhode.":
    "틱톡에서 #RhodeSkin 헤일리 비버 뷰티 브랜드 바이럴. 립 펩타이드 트렌드.",

  // === Fashion ===
  "TikTok Bridgerton-inspired fashion spin viral. Corset + lace + pastel trend.":
    "틱톡에서 브리저튼 영감 패션 스핀 바이럴. 코르셋+레이스+파스텔 트렌드.",

  // === Entertainment / Challenges ===
  "TikTok Bridgerton-inspired spin/dance challenge viral. Regency era fashion tie-in.":
    "틱톡에서 브리저튼 영감 스핀/댄스 챌린지 바이럴. 리젠시 시대 패션 연계.",

  "TikTok Oscars outfit tier list challenge viral 3/15. Fashion rating content.":
    "틱톡에서 오스카 아웃핏 티어리스트 챌린지 3/15 바이럴. 패션 평가 콘텐츠.",

  "TikTok Therian challenge (animal behavior mimicry) viral. Banned in 8 cities. Social phenomenon.":
    "틱톡에서 #Therian 챌린지(동물 행동 모방) 바이럴. 8개 도시 금지. 사회적 현상.",

  "TikTok Therian challenge (animal behavior mimicry) viral in Guatemala. Banned in 8 cities.":
    "틱톡에서 #Therian 챌린지(동물 행동 모방) 과테말라 바이럴. 8개 도시 금지.",

  "TikTok 30-second recipe challenge viral. Quick cooking content format.":
    "틱톡에서 30초 레시피 챌린지 바이럴. 초고속 쿠킹 콘텐츠 포맷.",

  "TikTok #TryNotToLaaf challenge (gugamiest audio) viral in India. Comedy content.":
    "틱톡에서 #TryNotToLaaf 챌린지(gugamiest 오디오) 인도 바이럴. 코미디 콘텐츠.",

  // === Apple / Pokemon brands ===
  "Apple brand refreshing TikTok presence. New marketing strategy viral.":
    "틱톡에서 Apple 브랜드 새 마케팅 전략 바이럴. 틱톡 존재감 리프레시.",

  "Pokemon brand TikTok challenge viral. Fan participation content.":
    "틱톡에서 Pokemon 브랜드 챌린지 바이럴. 팬 참여 콘텐츠.",

  // === Burger King ===
  "Burger King CEO taste test TikTok video viral. Authentic brand content.":
    "틱톡에서 Burger King CEO 맛 테스트 영상 바이럴. 진정성 있는 브랜드 콘텐츠.",

  // === Regional food creators ===
  "TikTok food creator with 58M followers. Lebanese food content viral globally.":
    "틱톡에서 팔로워 5,800만 푸드 크리에이터 바이럴. 레바논 음식 콘텐츠 글로벌 화제.",

  "TikTok Courtney Cook sweet potato + cheese recipe viral. Comfort food trend.":
    "틱톡에서 Courtney Cook 고구마+치즈 레시피 바이럴. 컴포트 푸드 트렌드.",

  "TikTok birria (Mexican stew) content continuing viral. Street food trend.":
    "틱톡에서 비리아(멕시코 스튜) 콘텐츠 지속 바이럴. 스트리트 푸드 트렌드.",

  "TikTok street food taste test with AI viral in Mexico. Tech + food content.":
    "틱톡에서 멕시코 스트리트 푸드 AI 맛 테스트 바이럴. 테크+푸드 콘텐츠.",

  // === Regional dance/music ===
  "TikTok Amapiano dance challenge viral in South Africa. Music + dance trend.":
    "틱톡에서 아마피아노 댄스 챌린지 남아공 바이럴. 음악+댄스 트렌드.",

  "TikTok cumbia remix dance challenge with footwork viral in Argentina.":
    "틱톡에서 쿰비아 리믹스 댄스 챌린지 아르헨티나 바이럴. 풋워크 중심.",

  "TikTok cumbia remix dance challenge with footwork viral in Colombia.":
    "틱톡에서 쿰비아 리믹스 댄스 챌린지 콜롬비아 바이럴. 풋워크 중심.",

  // === Philippines ===
  "TikTok Bebot challenge viral in Philippines. 2000s Filipina baddie aesthetic.":
    "틱톡에서 #Bebot 챌린지 필리핀 바이럴. 2000년대 필리피나 배디 미학.",

  "TikTok Hawak Mo Ang Beat dance challenge viral in Philippines.":
    "틱톡에서 Hawak Mo Ang Beat 댄스 챌린지 필리핀 바이럴.",

  "TikTok modern Filipiniana fashion trend viral. Traditional + contemporary Filipino style.":
    "틱톡에서 모던 필리피니아나 패션 트렌드 바이럴. 전통+현대 필리핀 스타일.",

  // === Pacific Islands ===
  "TikTok Polynesian cultural dance viral in Samoa. Miss Pacific Islands 2026.":
    "틱톡에서 폴리네시안 문화 댄스 사모아 바이럴. 미스 퍼시픽 아일랜드 2026 연계.",

  "TikTok Polynesian cultural dance viral in Tonga. Miss Pacific Islands 2026.":
    "틱톡에서 폴리네시안 문화 댄스 통가 바이럴. 미스 퍼시픽 아일랜드 2026 연계.",

  "TikTok Polynesian cultural dance viral. Miss Pacific Islands 2026 tie-in.":
    "틱톡에서 폴리네시안 문화 댄스 바이럴. 미스 퍼시픽 아일랜드 2026 연계.",

  // === New Zealand ===
  "TikTok Kapa Haka Maori cultural performance content viral in New Zealand.":
    "틱톡에서 카파 하카 마오리 문화 퍼포먼스 뉴질랜드 바이럴.",

  // === Africa specific ===
  "TikTok Ghanaian chef met TikTok CEO at Cannes. African food creator viral.":
    "틱톡에서 가나 셰프 칸 영화제서 틱톡 CEO 만남. 아프리카 푸드 크리에이터 바이럴.",

  "TikTok Kenyan cinematic cooking creator viral. High-quality food content.":
    "틱톡에서 케냐 시네마틱 쿠킹 크리에이터 바이럴. 고퀄리티 푸드 콘텐츠.",

  "TikTok Kenyan interior design creator viral. Savannah-inspired space design.":
    "틱톡에서 케냐 인테리어 디자인 크리에이터 바이럴. 사바나 영감 공간 디자인.",

  "TikTok Nigerian medical education creator viral. Healthcare content reaching millions.":
    "틱톡에서 나이지리아 의료 교육 크리에이터 바이럴. 수백만 도달 헬스케어 콘텐츠.",

  "TikTok South African creator viral. Asian-SA fusion food content.":
    "틱톡에서 남아공 크리에이터 바이럴. 아시안-남아공 퓨전 푸드 콘텐츠.",

  "TikTok South African modest fashion creator @tolthema viral.":
    "틱톡에서 남아공 모디스트 패션 크리에이터 @tolthema 바이럴.",

  "TikTok SAMI Ethiopian creator viral. Ethiopian food challenge content.":
    "틱톡에서 SAMI 에티오피아 크리에이터 바이럴. 에티오피아 음식 챌린지 콘텐츠.",

  // === Southeast Asia ===
  "TikTok viral Indonesian brand. TikTok Shop Indonesia GMV $6B market.":
    "틱톡에서 인도네시아 브랜드 바이럴. 틱톡샵 인도네시아 GMV $60억 시장.",

  "TikTok body creams 226K likes viral in Thailand. Moisturizing essential.":
    "틱톡에서 바디크림 22.6만 좋아요 태국 바이럴. 보습 필수템.",

  "TikTok teh tarik molecular foam viral. Modern twist on traditional Malaysian drink.":
    "틱톡에서 떼 따릭 분자 폼 바이럴. 전통 말레이시아 음료의 현대적 변주.",

  "TikTok micro-EV trend viral in Singapore. Urban mobility solution.":
    "틱톡에서 마이크로 EV 트렌드 싱가포르 바이럴. 도시 모빌리티 솔루션.",

  "TikTok smart home products trending in Singapore. Home automation viral.":
    "틱톡에서 스마트 홈 제품 싱가포르 트렌딩 바이럴. 홈 오토메이션.",

  // === Australia ===
  "TikTok Australian outdoor/surf fashion trend. Beach lifestyle viral content.":
    "틱톡에서 호주 아웃도어/서프 패션 트렌드 바이럴. 비치 라이프스타일 콘텐츠.",

  // === Brazil ===
  "TikTok livestream auction trend viral in Brazil. 100M users market. Live commerce.":
    "틱톡에서 브라질 라이브 경매 트렌드 바이럴. 1억 사용자 시장. 라이브 커머스.",

  // === C-Beauty / China ===
  "Douyin livestream viral C-Beauty brand. Leading Chinese skincare brand. Tmall.":
    "더우인에서 C-뷰티 브랜드 라이브스트림 바이럴. 중국 선도 스킨케어 브랜드. Tmall.",

  "Douyin viral C-Beauty skincare brand. Top Chinese local cosmetics brand. JD.com.":
    "더우인에서 C-뷰티 스킨케어 브랜드 바이럴. 중국 탑 로컬 화장품 브랜드. JD.com.",

  "Douyin viral Gen Z C-Beauty makeup brand. Douyin Shop.":
    "더우인에서 Z세대 C-뷰티 메이크업 브랜드 바이럴. 더우인 샵.",

  // === Japan ===
  "Japanese chain growing via TikTok viral. TikTok Shop Japan market expanding.":
    "틱톡에서 일본 체인 성장 바이럴. 틱톡샵 일본 시장 확장.",

  // ===========================================
  // 19 additional descriptions (non-NULL name_local or escaped quotes)
  // ===========================================

  // China specific (name_local present)
  "Douyin #松弛感穿搭 2.97B views, 32.8M interactions. Relaxed luxury casual style.":
    "더우인에서 #松弛感穿搭 29.7억 뷰, 3,280만 인터랙션 바이럴. 릴랙스드 럭셔리 캐주얼 스타일.",

  "Douyin L''Oreal Versailles Challenge 19.3M views, 19M yuan GMV. Brand challenge viral.":
    "더우인에서 L''Oreal 베르사유 챌린지 1,930만 뷰, 1,900만 위안 GMV 바이럴. 브랜드 챌린지.",

  "Douyin organic/green food +27.9% YoY growth. Health trend. JD.com.":
    "더우인에서 유기농/친환경 식품 전년 대비 +27.9% 성장 바이럴. 건강 트렌드. JD.com.",

  // Israel specific (escaped quotes in description)
  "TikTok ''Tel Aviv 2026'' global viral satire trend. Cultural commentary content.":
    "틱톡에서 ''Tel Aviv 2026'' 글로벌 풍자 트렌드 바이럴. 문화 비평 콘텐츠.",

  // Japan specific (name_local present)
  "TikTok #Furikake versatile seasoning trend going global. Traditional Japanese rice topping.":
    "틱톡에서 #Furikake 만능 시즈닝 트렌드 글로벌 확산 바이럴. 전통 일본 밥 토핑.",

  "TikTok #Musubi variations viral: chicken katsu, Cuban, banh mi. Street food fusion.":
    "틱톡에서 #Musubi 변형 바이럴: 치킨카츠, 쿠바식, 반미. 스트리트 푸드 퓨전.",

  "TikTok #ギャル Y2K gyaru makeup + fashion revival viral. SHIBUYA109.":
    "틱톡에서 #ギャル Y2K 갸루 메이크업+패션 리바이벌 바이럴. SHIBUYA109.",

  "TikTok #Dreamcore dreamy pastel + oversized outfits viral in Japan. WEGO.":
    "틱톡에서 #Dreamcore 드리미 파스텔+오버사이즈 아웃핏 일본 바이럴. WEGO.",

  "TikTok #JetJetDance Japan-original dance challenge viral. Short-form dance videos millions of views.":
    "틱톡에서 #JetJetDance 일본 오리지널 댄스 챌린지 바이럴. 숏폼 댄스 영상 수백만 조회수.",

  // Korea specific (name_local present + escaped quotes)
  "Kany (French dancer) TikTok challenge viral in Korea. Korean terms: smooth/flat/bumpy went viral.":
    "틱톡에서 Kany(프랑스 댄서) 챌린지 한국 바이럴. 매끈/납작/울퉁불퉁 한국어 밈 확산.",

  "IVE Jang Wonyoung SNS viral. Dubai chocolate chewy cookie causing cafe open-runs in Korea.":
    "IVE 장원영 SNS 바이럴. 두바이 초콜릿 쫀득 쿠키 카페 오픈런 현상.",

  "Global gut health trend driving Korean fermented foods viral. Premium kimchi exports rising.":
    "글로벌 장건강 트렌드로 한국 발효식품 바이럴. 프리미엄 김치 수출 증가.",

  "TikTok Amyflamy-led K-Beauty ulzzang makeup trend. Glass skin + eyeliner emphasis. Olive Young.":
    "틱톡에서 Amyflamy 주도 K-뷰티 울짱 메이크업 트렌드 바이럴. 글래스 스킨+아이라이너 강조. 올리브영.",

  "TikTok/Instagram #올리브영추천 viral. K-Beauty mecca. Nationwide stores + online.":
    "틱톡/인스타그램에서 #올리브영추천 바이럴. K-뷰티 성지. 전국 매장+온라인.",

  // Malaysia specific (escaped quotes)
  "TikTok ''looks cheap but premium'' fashion trend 3.2x CTR in Malaysia.":
    "틱톡에서 ''싸 보이지만 프리미엄'' 패션 트렌드 말레이시아 바이럴. CTR 3.2배.",

  // Thailand specific (name_local present)
  "TikTok tom yum sous-vide fusion viral. Traditional Thai vs Gen Z modern cooking.":
    "틱톡에서 똠얌 수비드 퓨전 바이럴. 전통 태국식 vs Z세대 현대 쿠킹.",

  // Taiwan specific (name_local present)
  "TikTok Taiwan pineapple cake and mochi travel content viral. Tourist food trend.":
    "틱톡에서 대만 펑리수(파인애플 케이크)와 모찌 여행 콘텐츠 바이럴. 관광 먹거리 트렌드.",

  // Ukraine specific (escaped quotes)
  "TikTok ''365 buttons'' first viral meme of 2026. Active TikTok community in Ukraine.":
    "틱톡에서 ''365 buttons'' 2026년 첫 바이럴 밈. 우크라이나 활발한 틱톡 커뮤니티.",

  // Vietnam specific (name_local present)
  "TikTok viral Vietnamese fashion brand. TikTok Shop Vietnam GMV $3.4B market.":
    "틱톡에서 베트남 패션 브랜드 바이럴. 틱톡샵 베트남 GMV $34억 시장.",
};

// Read source
const inputPath = path.join(__dirname, 'output', 'trends_v6_verified.sql');
const outputPath = path.join(__dirname, 'output', 'trends_v6_korean.sql');

let content = fs.readFileSync(inputPath, 'utf-8');

console.log(`Description mappings: ${Object.keys(descMap).length}`);

// Process line by line
let replacedCount = 0;
let unmatchedLines = [];

const lines = content.split('\n');
const outputLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  if (!line.startsWith('INSERT')) {
    outputLines.push(line);
    continue;
  }

  // Use a robust regex to extract description
  // Pattern: (NULL|'something'), 'description', number, 'rising/steady/declining'
  // Description may contain escaped single quotes ''
  const descMatch = line.match(/(NULL|'[^']*(?:''[^']*)*'),\s*'([^']*(?:''[^']*)*)',\s*(\d+),\s*'(rising|steady|declining)'/);

  if (!descMatch) {
    outputLines.push(line);
    unmatchedLines.push({ line: i + 1, reason: 'no regex match' });
    continue;
  }

  const nameLocal = descMatch[1];
  const engDesc = descMatch[2];
  const korDesc = descMap[engDesc];

  if (!korDesc) {
    outputLines.push(line);
    unmatchedLines.push({ line: i + 1, desc: engDesc });
    continue;
  }

  // Replace the description in the line
  // We need to replace the exact occurrence: nameLocal, 'engDesc', number
  const oldPart = `${nameLocal}, '${engDesc}',`;
  const newPart = `${nameLocal}, '${korDesc}',`;
  line = line.replace(oldPart, newPart);
  outputLines.push(line);
  replacedCount++;
}

// Write output
fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');

console.log(`\nResults:`);
console.log(`- Total INSERT lines: ${lines.filter(l => l.startsWith('INSERT')).length}`);
console.log(`- Replaced: ${replacedCount}`);
console.log(`- Unmatched: ${unmatchedLines.length}`);

if (unmatchedLines.length > 0) {
  console.log('\nUnmatched descriptions:');
  unmatchedLines.forEach(u => {
    console.log(`  Line ${u.line}: ${u.desc || u.reason}`);
  });
}

// Verify no English-only descriptions remain
const outputContent = fs.readFileSync(outputPath, 'utf-8');
const outputInserts = outputContent.split('\n').filter(l => l.startsWith('INSERT'));
let englishRemaining = 0;
let koreanCount = 0;
for (const line of outputInserts) {
  const m = line.match(/(NULL|'[^']*(?:''[^']*)*'),\s*'([^']*(?:''[^']*)*)',\s*(\d+),\s*'(rising|steady|declining)'/);
  if (m) {
    const desc = m[2];
    if (/[가-힣]/.test(desc)) {
      koreanCount++;
    } else {
      englishRemaining++;
      if (englishRemaining <= 5) {
        console.log(`  Still English: "${desc.substring(0, 80)}..."`);
      }
    }
  }
}
console.log(`\nVerification:`);
console.log(`- Korean descriptions: ${koreanCount}`);
console.log(`- English descriptions remaining: ${englishRemaining}`);
console.log(`- Output file: ${outputPath}`);
