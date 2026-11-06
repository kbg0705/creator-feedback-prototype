# Cushy AI 서버 (Cloudflare Worker)

공개 사이트(`/b4/`)에서 새 댓글을 AI로 만들 때 쓰는 중계 서버예요. AI 키는 이 서버에만 있고, 사이트 코드에는 보이지 않아요.

## 설정 순서

1. https://dash.cloudflare.com 에 무료로 가입해요.
2. **Workers & Pages → Create → Create Worker** → 이름을 `peekeep-cushy`로 하고 **Deploy**.
3. **Edit code**를 눌러 기존 코드를 모두 지우고, 이 폴더의 `worker.js` 내용을 붙여 넣은 뒤 **Deploy**.
4. Worker의 **Settings → Variables and Secrets → Add**에서 아래 두 개를 **Secret**으로 추가해요.
   - `ACCESS_CODE` = `0000` (사이트에서 입력할 암호)
   - AI 키 하나:
     - Claude: `ANTHROPIC_API_KEY` (https://console.anthropic.com 에서 발급, 유료 크레딧 필요)
     - Gemini 무료: `GEMINI_API_KEY` (https://aistudio.google.com 에서 발급)
5. 화면 위쪽의 Worker 주소(`https://peekeep-cushy.<계정이름>.workers.dev`)를 복사해서 `b4/index.html`의 `const CUSHY_API = "";` 따옴표 안에 넣어요.

## 지켜지는 것

- `https://kbg0705.github.io`에서 온 요청만 받아요.
- 암호가 틀리면 AI를 부르지 않아요.
- 댓글과 작성자 이름만 받고, 프롬프트는 서버에서 만들어요. 그래서 이 주소를 다른 용도의 AI 통로로 쓸 수 없어요.
- 댓글은 300자까지만 받아요.
