import { Ai } from '@cloudflare/ai';
import { Hono } from 'hono';
const app = new Hono();

app.get('/', async (c) => {
	const ai = new Ai(c.env.AI);

	const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
		messages: [{ role: 'user', content: 'What is hello world?' }],
	});

	return c.json(answer);
});

export default app;
