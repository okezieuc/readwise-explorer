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
	const ai = new Ai(c.env.AI);

	const { readwiseApiKey } = await c.req.json();
	if (!readwiseApiKey) {
		return c.json({
			error: 'Send your readwise API key in the body your request',
		});
	}

	const allHighlights = [];

	const readWiseData = await fetchFromReadwiseExportApi(readwiseApiKey);
	readWiseData.forEach((book) => {
		book['highlights'].forEach((highlight) => {
			// highlight.text is our text
			allHighlights.push(highlight.text);
		});
	});

	await Promise.all(
		allHighlights.map(async (highlight) => {
			// upload the text to d1
			const { results } = await c.env.DB.prepare('INSERT INTO highlights (text) VALUES (?) RETURNING *').bind(highlight).run();

			const highlightDbRecord = results.length ? results[0] : null;
			if (!highlightDbRecord) {
				return c.text({ error: 'an error occured when creating one of your notes' }, 500);
			}

			// create an embedding for the text
			const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [highlight] });
			const embedding = data[0];

			if (!embedding) {
				return c.text('Failed to generate vector embedding', 500);
			}

			// upload the embedding to vectorize
			const { id } = highlightDbRecord;
			await c.env.VECTORIZE_INDEX.insert([
				{
					id: id.toString(),
					values: embedding,
				},
			]);
		})
	);

	return c.json({ success: 'uploaded all highlights to vectorize' });
});

app.get('/similar', async (c) => {
	const ai = new Ai(c.env.AI);

	// get the ID of the document the request was sent for
	const highlightId = c.req.query('highlightId');
	if (!highlightId) {
		return c.json(
			{
				error: 'send the id of a document',
			},
			400
		);
	}

	// get the contents of the highlight with that ID
	const requestedHighlightContentQuery = `SELECT * FROM highlights WHERE id = (?);`;
	const { results } = await c.env.DB.prepare(requestedHighlightContentQuery).bind(highlightId).all();
	const relevantHighlight = results.length ? results[0].text : null;

	if (!relevantHighlight) {
		return c.json({
			error: 'no document exists with the ID provided',
		});
	}

	// create a vector embedding for the relevant content
	const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [relevantHighlight] });
	const relevantHighlightEmbedding = data[0];
	if (!relevantHighlightEmbedding) {
		return c.text('Failed to generate vector embedding', 500);
	}

	// query vectorize for similar content
	const vectorQuery = await c.env.VECTORIZE_INDEX.query(relevantHighlightEmbedding, { topK: 4 });
	const vectorIds = vectorQuery.matches.map((vec) => vec.vectorId);

	// query D1 with the IDs to receive the actual content
	if (!vectorIds.length) {
		return c.json([]);
	}

	const relevantHighlightsContentQuery = `SELECT * FROM highlights where id IN (${vectorIds.join(', ')}) AND id <> (?) `;
	const { results: relevantHighlightContents } = await c.env.DB.prepare(relevantHighlightsContentQuery).bind(highlightId).all();

	// return the content to the calller
	return c.json(relevantHighlightContents);
});

app.onError((err, c) => {
	return c.text(err);
});

export default app;
