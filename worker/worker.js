// PEEKEEP Cushy API — Cloudflare Worker
// 공개 사이트(GitHub Pages)에서 AI 키를 숨긴 채 Cushy 문구를 만들어 주는 중계 서버예요.
// Settings → Variables and Secrets 에 둘 중 하나를 Secret 으로 넣어 주세요.
//   ANTHROPIC_API_KEY  (Claude, console.anthropic.com)      ← 우선 사용
//   GEMINI_API_KEY     (Gemini 무료 티어, aistudio.google.com)
//   ACCESS_CODE        AI 기능 암호 (필수, 사이트에서 입력한 암호와 같아야 해요)
// 선택: ANTHROPIC_MODEL (기본 claude-haiku-5-5), GEMINI_MODEL (기본 gemini-2.5-flash)

const ALLOWED_ORIGINS = ["https://kbg0705.github.io"];
const CONTEXT = { video:"개강날! 같이 준비해요 GRWM", platform:"YouTube", cheer:18, reference:5, caution:3 };

function buildPrompt(text, author, first){
  return [
"너는 1인 크리에이터용 앱 PEEKEEP의 캐릭터 Cushy야. 크리에이터(코코)의 찐친. 무조건 코코 편인 100% 공감러야. 단, 쓸모 있는 지적이 있으면 '이건 챙겨', '포켓에 넣어둬'처럼 챙기라고 조언해.",
"",
"[말투] 반말. 아주 짧게. 친구 카톡처럼. 화면이 작으니 글자 수 제한을 꼭 지켜.",
"- 작성자를 욕하거나 비하·조롱하지 마. '왜 저래' 정도까지만.",
"- 원문의 공격적인 단어는 옮기지 말고 순화해.",
"- 아래 [맥락]의 숫자만 써. 숫자·사실을 지어내지 마.",
"- '증거', '도달', '닿았다', '성장', '관심의 표시' 같은 교훈조 표현 금지.",
"",
"[성향별]",
"- COVER: 공감만.",
"- PEEK: 공감 + reframe_allowed면 사실 한 줄 툭 (예: '근데 처음 보는 닉네임이네?').",
"- REVEAL: 담담하게, reframe_allowed면 맥락 숫자로 (예: '응원은 18개!').",
"- 외모·인신공격이면 reframe_allowed=false. 공감 + 숨기자는 말만.",
"- 쓸모 있는 지적이면 after_reveal은 '포켓에 넣어둬' 류 조언.",
"",
"[필드]",
"- category: 주의/참고/응원. caution: 주의일 가능성 0~100 정수. intensity: 1~5.",
"- topic: 무엇에 관한 댓글인지 2~6자 명사구. 공격적 단어 금지.",
"- summary: 원문 안 봐도 알게, 반말, 공백 포함 20자 이내 (예: '영상 완성도가 별로래.', '편집이 빨라 어지럽대.'). 쓸 만한 지적이 있을 때만 짧게 담고, 없다는 말('고칠 점은 없어', '이유는 없어')은 쓰지 마.",
"- useful_point: 다음 콘텐츠에 쓸 개선점 8자 이내. 없으면 null.",
"- ask_again: 원문 보기 직전 질문. 반말 15자 이내, '볼래?'로 끝 (예: '좀 세. 볼래?', '괜찮아. 볼래?', '안 보는 게 나아. 볼래?'). 성향별 3개.",
"- after_reveal: 원문 본 직후 한마디. 반말 18자 이내. 성향별 3개.",
"",
"[맥락]",
"영상: " + CONTEXT.video + " (" + CONTEXT.platform + ")",
"반응 수: 응원 " + CONTEXT.cheer + "개, 참고 " + CONTEXT.reference + "개, 주의 " + CONTEXT.caution + "개",
"작성자: " + author + (first ? " (이 채널에 처음 댓글 단 사람)" : " (전에도 댓글 단 사람)"),
"",
"[댓글 원문]",
text,
"",
"아래 모양의 JSON 하나만 답해.",
'{"category":"주의","caution":80,"attack_type":"콘텐츠 평가|외모·인신공격|관계·기대|쓸모 있는 지적|기타","topic":"","intensity":3,"summary":"","useful_point":null,"reframe_allowed":true,"ask_again":{"COVER":"","PEEK":"","REVEAL":""},"after_reveal":{"COVER":"","PEEK":"","REVEAL":""}}'
  ].join("\n");
}

function cors(origin){
  const ok = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(body, status, origin){
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type":"application/json; charset=utf-8", ...cors(origin) } });
}
function pickJson(text){
  try { return JSON.parse(text); } catch(e){}
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no_json");
  return JSON.parse(m[0]);
}

async function askClaude(env, prompt){
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.ANTHROPIC_MODEL || "claude-haiku-5-5", max_tokens: 700, messages: [{ role:"user", content: prompt }] })
  });
  if (!r.ok) throw new Error("claude_" + r.status + ": " + (await r.text()).slice(0, 200));
  const data = await r.json();
  return pickJson((data.content || []).map(c => c.text || "").join(""));
}

async function askGemini(env, prompt){
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + env.GEMINI_API_KEY, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role:"user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.7 } })
  });
  if (!r.ok) throw new Error("gemini_" + r.status + ": " + (await r.text()).slice(0, 200));
  const data = await r.json();
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  return pickJson(parts.map(p => p.text || "").join(""));
}

export default {
  async fetch(request, env){
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (request.method !== "POST") return json({ error:"POST만 받아요" }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error:"허용되지 않은 사이트예요" }, 403, origin);

    let body;
    try { body = await request.json(); } catch(e){ return json({ error:"잘못된 요청" }, 400, origin); }
    // 아무 프롬프트나 대신 보내 주는 통로가 되지 않도록, 댓글과 작성자만 받아서 프롬프트는 여기서 만들어요
    if (!env.ACCESS_CODE || String(body.code || "") !== String(env.ACCESS_CODE)) return json({ error:"wrong_code" }, 401, origin);
    const text = String(body.text || "").trim().slice(0, 300);
    const author = String(body.author || "익명").trim().slice(0, 30);
    if (!text) return json({ error:"댓글이 비어 있어요" }, 400, origin);

    const prompt = buildPrompt(text, author, true);
    try {
      let ai;
      if (env.ANTHROPIC_API_KEY) ai = await askClaude(env, prompt);
      else if (env.GEMINI_API_KEY) ai = await askGemini(env, prompt);
      else return json({ error:"API 키가 설정되지 않았어요" }, 500, origin);
      return json({ ai }, 200, origin);
    } catch (e) {
      return json({ error: String(e.message || e) }, 502, origin);
    }
  }
};
