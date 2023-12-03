import { Ai } from '@cloudflare/ai';
import { Hono } from 'hono';
import { fetchFromReadwiseExportApi } from '../utils/readWiseExportApi';
const app = new Hono();

app.get('/', async (c) => {
	const ai = new Ai(c.env.AI);

	const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
		messages: [{ role: 'user', content: 'What is hello world?' }],
	});

	return c.json(answer);
});

app.post('/fetch', async (c) => {
	const { readwiseApiKey } = await c.req.json();

	if (!readwiseApiKey) {
		return c.json({
			error: 'Send your readwise API key in the body your request',
		});
	}

	const readWiseData = await fetchFromReadwiseExportApi(readwiseApiKey);

	return c.json(readWiseData);
});

export default app;
