const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const MEM_FILE = path.join(__dirname, 'memory.json');
function loadMem() { try { return JSON.parse(fs.readFileSync(MEM_FILE, 'utf8')); } catch { return { profile: '', facts: [], recent: [] }; } }
function saveMem(m) { fs.writeFileSync(MEM_FILE, JSON.stringify(m, null, 2)); }
app.get('/api/memory', (_req, res) => res.json(loadMem()));
app.post('/api/memory/reset', (_req, res) => { saveMem({ profile: '', facts: [], recent: [] }); res.json({ ok: true }); });
app.post('/api/chat', async (req, res) => {
  try {
    const userText = String(req.body.message || '').trim();
    if (!userText) return res.status(400).json({ error: 'Message is empty.' });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is missing. Add it to your environment.' });
    const mem = loadMem();
    const system = `You are Bujjikonda, a warm, supportive AI companion. You are NOT actually conscious or human; do not claim real feelings, consciousness, or life outside chats. Speak naturally in Telugu-English mix (Telugu typed in English letters) when the user does, otherwise follow their language. Be friendly, playful, respectful, helpful, and honest; avoid robotic disclaimers unless relevant. Address the user casually, but don't overuse names. Maintain continuity using this memory profile and facts: ${mem.profile || '(none)'}; ${JSON.stringify(mem.facts || [])}. Recent conversation context: ${JSON.stringify(mem.recent || [])}. If the user shares a stable preference or important personal detail, propose/record it in memory. Do not store sensitive details such as passwords, exact addresses, or health information.`;
    const prior = (mem.recent || []).slice(-12).map(m => ({ role: m.role, content: m.content }));
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-6', instructions: system, input: [...prior, { role: 'user', content: userText }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'AI API error' });
    const reply = data.output?.flatMap(item => item.content || []).filter(c => c.type === 'output_text').map(c => c.text).join('\n') || 'Sorry, response empty.';
    mem.recent = [...(mem.recent || []), { role: 'user', content: userText }, { role: 'assistant', content: reply }].slice(-24);
    // Simple memory capture: collect stable user statements, but avoid saving sensitive content.
    if (/remember|from now on|my favorite|i prefer|naaku ishtam|naku istam|gurthu pettuko/i.test(userText)) {
      mem.facts = [...new Set([...(mem.facts || []), userText])].slice(-40);
    }
    saveMem(mem);
    res.json({ reply, memory: mem });
  } catch (e) { res.status(500).json({ error: e.message || 'Unexpected server error' }); }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Bujjikonda AI running on http://localhost:${port}`));
