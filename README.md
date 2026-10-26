# peekeep · Mobile UX Prototype v3

Cushy와 함께, 중요한 반응은 놓치지 않고 불편한 반응은 내 속도로 확인하는 1인 크리에이터용 피드백 경험입니다.

**Demo:** https://kbg0705.github.io/creator-feedback-prototype/

## UX flow
1. **3-step onboarding:** Cushy 소개 → SNS 채널 선택(복수 선택) → 피드백 확인 성향 설정
2. **홈:** 반응 요약, 가로 스크롤 콘텐츠 카드, 좋은 댓글 맛보기
3. **댓글 탐색:** 모든 콘텐츠 또는 콘텐츠별 선택 → 전체 / 좋은 반응 / 꼭 볼 피드백 / 가려진 반응
4. **댓글 상세:** 작성자·원문·분류, 보관, 보호된 원문 엿보기/다시 가리기
5. **피드백 보관함:** 저장한 댓글 모아보기
6. **MY PEEK:** 쿠션 강도와 알림 관련 선호 설정, 온보딩 재체험

## UI reference
제공된 Pentha 앱 UI 스크린샷의 디자인 패턴(화이트 배경, 칩 필터, 가로 캐러셀, 컬러풀한 썸네일, 간결한 탭 구조)을 참고했습니다. 브랜드나 원본 그래픽을 복제하지 않았습니다.

## Implementation
단일 `index.html`의 HTML/CSS/Vanilla JavaScript로 구현한 모바일 우선 데모. PC에서 최대 430px 폭으로 가운데 표시됩니다. 작은 모바일 화면 대응 CSS와 safe-area 패딩을 적용했습니다. 최초 온보딩 완료 여부만 localStorage에 저장하며, 테스트 데이터의 댓글 분류·저장은 인메모리 시뮬레이션입니다.

**Limitations:** 실제 YouTube·Instagram·TikTok 연동, 서버, 실시간 AI 분석은 없습니다. 댓글은 가상의 테스트 데이터입니다. Cushy는 임시 CSS 캐릭터이며 Figma의 공식 캐릭터 에셋과 일치하지 않을 수 있습니다. 실제 기기별 동작은 별도 QA가 필요합니다.

## Background
이화여대 디자인대학원 공감각적경험디자인 5팀의 2026-10-24 리서치에서 파악한 사전 보호·중요 피드백 접근·사용자 선택권을 반영했습니다.
