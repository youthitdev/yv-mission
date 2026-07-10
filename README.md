# 발견미션 (Discovery Mission)

TMI 프로젝트의 "발견미션" 페이지 재구현본. React + Vite + Supabase.

## 1. 설치

```bash
npm install
cp .env.example .env   # 아래 2번에서 얻은 값 입력
npm run dev
```

## 2. Supabase 설정

1. https://supabase.com 에서 새 프로젝트 생성
2. `supabase/schema.sql` 내용을 SQL Editor에서 그대로 실행
   - 테이블: `profiles`, `projects`, `project_members`, `mission_categories`, `missions`, `user_mission_progress`
   - RPC: `draw_mission`(뽑기), `use_mission_pass`(미션패스), `complete_mission`(완료 처리)
   - RLS 정책까지 포함되어 있습니다.
3. Project Settings > API 에서 `Project URL`, `anon public key` 를 복사해 `.env` 에 입력
4. 관리자 계정 지정: 로그인 1회 후 `profiles` 테이블에서 해당 유저의 `is_admin` 을 `true` 로 변경

## 3. 카카오 로그인 설정

Supabase Auth는 카카오를 기본 제공 provider로 지원하지 않으므로 아래 중 하나로 연동합니다.

- **권장**: Supabase Dashboard > Authentication > Providers 에서 `Kakao` 항목이 노출되면 그대로 사용
  (카카오 개발자 콘솔에서 발급받은 REST API 키 / Client Secret / Redirect URI 등록)
- 카카오 개발자 콘솔(https://developers.kakao.com) > 내 애플리케이션 > 카카오 로그인 활성화
  - Redirect URI: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
- 코드에서는 `supabase.auth.signInWithOAuth({ provider: 'kakao' })` 로 호출합니다 (`src/context/AuthContext.jsx` 참고).

## 4. 기수(시즌) / 미션 데이터 입력

1. 로그인 후 관리자 계정으로 우측 상단 ☰ 메뉴 > **ADMIN** 진입
2. "기수 관리" 탭에서 기수 생성
   - Max Mission: 한 유저가 전체 기간 동안 뽑을 수 있는 미션 개수 (기본 5)
   - Interval(초): 미션 1개가 열려있는 시간 (기본 345600 = 4일)
   - Pass Cnt: 미션패스 사용 가능 횟수 (기본 1)
3. "미션 관리" 탭에서 해당 기수에 미션 1~50번을 카테고리(혼자/함께/이동/새로움/관찰)와 함께 등록

## 5. 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/login` | 카카오 로그인 |
| `/` | 홈 - 카운트다운 + Now 카드(뽑기/현재 미션) + 5개 카테고리 타일 |
| `/missions` | 미션선택 - 카테고리별 미션 목록 |
| `/history` | 미션확인 - 내가 뽑은 미션 이력 (진행중/완료/패스/만료) |
| `/profile` | 정보수정 - 닉네임/연락처 수정 |
| `/admin` | ADMIN - 기수/미션 관리 (is_admin 유저만 접근 가능) |

## 6. 핵심 로직

- 미션 뽑기, 미션패스, 완료 처리는 모두 Supabase RPC(`draw_mission`, `use_mission_pass`, `complete_mission`)를 통해서만 수행됩니다.
  이 함수들이 "진행 중 미션 존재 여부", "4일 경과 여부", "패스 잔여 횟수", "마감 여부" 등을 서버 단에서 검증하므로
  클라이언트 코드에서 `user_mission_progress` 테이블을 직접 insert/update 하지 않도록 주의하세요.
- 카운트다운은 `expires_at` 기준으로 클라이언트에서 1초마다 갱신됩니다 (`src/components/CountdownBar.jsx`).

## 7. 빌드

```bash
npm run build
npm run preview
```
