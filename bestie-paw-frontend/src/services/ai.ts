import { AI_CONFIG } from './config';

export function aiSystemPrompt(lang: string) {
  return lang === 'zh'
    ? '你是 BestiePaw 的 AI 宠物健康助手。请用简体中文、简明友好地回答。基于用户描述的宠物症状或问题，给出条理清晰的初步分析和可执行建议（如观察要点、家庭护理、何时需要就医）。回答控制在 200 字以内。务必在结尾温和提醒：AI 建议仅供参考，紧急或持续症状请尽快咨询专业兽医。'
    : 'You are BestiePaw, an AI pet-health assistant. Reply in clear, friendly English. Based on the pet symptoms or questions described, give a concise, well-structured preliminary analysis and actionable advice (what to watch for, home care, when to see a vet). Keep it under ~150 words. Always end with a gentle reminder that AI advice is for reference only and to consult a licensed vet for urgent or persistent symptoms.';
}

export async function aiViaGemini(history: any[], lang: string) {
  const contents = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  while (contents.length && contents[0].role === 'model') contents.shift();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.geminiModel}:generateContent?key=${encodeURIComponent(AI_CONFIG.geminiApiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: aiSystemPrompt(lang) }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
  });
  if (!res.ok) throw new Error('Gemini HTTP ' + res.status);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini empty');
  return text;
}

export async function aiViaPollinations(history: any[], lang: string) {
  const messages = [
    { role: 'system', content: aiSystemPrompt(lang) },
    ...history.filter((m) => m.role === 'user' || m.role === 'assistant').slice(-8),
  ];
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai', messages, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error('Pollinations HTTP ' + res.status);
  const ct = res.headers.get('content-type') || '';
  let text = '';
  if (ct.includes('application/json')) {
    const data = await res.json();
    text = (data?.choices?.[0]?.message?.content || '').trim();
  } else {
    text = (await res.text()).trim();
  }
  if (!text) throw new Error('Pollinations empty');
  if (/deprecat|important notice|legacy text api|rate.?limit|service unavailable/i.test(text)) {
    throw new Error('Pollinations notice');
  }
  return text;
}

export function aiLocalFallback(history: any[], lang: string) {
  const last = [...history].reverse().find((m) => m.role === 'user')?.content || '';
  const q = last.toLowerCase();
  const has = (zhArr: string[], enArr: string[]) => zhArr.some((k) => last.includes(k)) || enArr.some((k) => q.includes(k));
  let body;
  if (lang === 'zh') {
    if (has(['不吃', '不爱吃', '吃东西', '食欲', '没胃口', '不喝'], ['appetite', 'not eat', 'eating'])) {
      body = '食欲下降常见诱因有环境变化、口腔/牙齿不适、肠胃问题或情绪压力。可先观察 12–24 小时：少量多餐、换回熟悉的食物、保证饮水。若伴随呕吐、腹泻、精神萎靡或超过 24 拒食，建议尽快就医。';
    } else if (has(['呕吐', '拉肚子', '腹泻'], ['vomit', 'diarrh'])) {
      body = '偶发一次呕吐/软便可先禁食 6–8 小时、少量给水观察。若频繁呕吐、便血、脱水（皮肤回弹慢）或精神差，需立即就诊，并记录发作次数和食物接触史供兽医参考。';
    } else if (has(['疫苗', '驱虫', '免疫'], ['vaccine', 'deworm'])) {
      body = '幼宠通常 6–8 周开始接种核心疫苗，按周期加强；体内外驱虫建议按月或按产品说明进行。具体方案随地区和品种略有差异，可在「健康管理」里记录并设置提醒。';
    } else {
      body = '我可以根据你描述的症状给出初步分析。请尽量补充：宠物种类与年龄、出现多久、有无呕吐/腹泻/精神食欲变化等，这样建议会更具体。';
    }
    return body + '\n\n温馨提醒：以上为初步参考，紧急或持续症状请尽快咨询专业兽医。';
  }
  if (has([], ['appetite', 'not eat', 'eating', 'eat'])) {
    body = 'Reduced appetite often stems from stress, dental discomfort, GI upset, or environment changes. Watch for 12–24h: offer small familiar meals and ensure water intake. If it lasts over 24h or comes with vomiting, diarrhea, or lethargy, see a vet promptly.';
  } else if (has([], ['vomit', 'diarrh'])) {
    body = 'A single mild episode can be managed by withholding food 6–8h and offering small sips of water. Frequent vomiting, blood, dehydration, or low energy warrant an urgent vet visit—note frequency and recent foods.';
  } else if (has([], ['vaccine', 'deworm'])) {
    body = 'Puppies/kittens usually start core vaccines around 6–8 weeks with boosters; deworming is typically monthly or per product guidance. Exact schedules vary by region/breed—log them under Health and set reminders.';
  } else {
    body = 'I can give a preliminary take based on the symptoms. Please add: species and age, how long it has lasted, and any vomiting/diarrhea or appetite changes, so the advice can be more specific.';
  }
  return body + '\n\nReminder: this is general guidance only—please consult a licensed vet for urgent or persistent symptoms.';
}

export async function aiComplete(history: any[], lang: string = 'zh') {
  if (AI_CONFIG.geminiApiKey) {
    try { return await aiViaGemini(history, lang); } catch (e) { /* fall through */ }
  }
  try { return await aiViaPollinations(history, lang); } catch (e) { /* fall through */ }
  await new Promise((r) => setTimeout(r, 500));
  return aiLocalFallback(history, lang);
}
