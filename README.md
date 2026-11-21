# Bujjikonda AI
A small web chat companion with a Telugu-English friendly personality and local persistent memory.


## Important
- This app is a chatbot, not truly conscious. The persona is designed to feel conversational and remember saved context.
- The OpenAI API key must be supplied privately as an environment variable. **Never put your API key in GitHub or browser code.**
- Memory is stored in `memory.json` on the server machine. It is not encrypted by this starter app. Avoid storing sensitive details.

## Run locally
1. Install Node.js 18+.
2. In this project folder, run `npm install`.
3. Set `OPENAI_API_KEY` in your environment (and optionally `OPENAI_MODEL`).
4. Run `npm start`.
5. Open `http://localhost:3000`.

The model name defaults to `gpt-6`; if your API account does not support it, set `OPENAI_MODEL` to a model you have access to.
