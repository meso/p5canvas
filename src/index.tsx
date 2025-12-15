import { Hono } from "hono";

type Bindings = {
	OPENROUTER_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post("/api/generate", async (c) => {
	let body: { prompt?: string };
	try {
		body = await c.req.json();
	} catch (e) {
		return c.json({ error: "Invalid JSON" }, 400);
	}

	if (!body || typeof body.prompt !== "string" || body.prompt.trim() === "") {
		return c.json({ error: "Missing prompt" }, 400);
	}

	const userPrompt = body.prompt;

	const systemPrompt = `You are a game configuration generator for P5Canvas.
Output ONLY a JSON object compatible with the Breakout game engine.
Do not output markdown code blocks.
Response must be a valid JSON.

Schema:
{
  "gameType": "breakout",
  "ballSpeed": number (3-10),
  "paddleWidth": number (50-200),
  "blockRows": number (3-8),
  "enemyColor": string (css color),
  "difficulty": "easy" | "normal" | "hard"
}`;

	try {
		const response = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${c.env.OPENROUTER_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "google/gemini-2.0-flash-exp:free",
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt },
					],
				}),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("OpenRouter Error:", errorText);
			return c.json({ error: "LLM API Error" }, 500);
		}

		const data = (await response.json()) as {
			choices: { message: { content: string } }[];
		};
		const content = data.choices[0]?.message?.content;

		if (!content) {
			return c.json({ error: "Empty response from LLM" }, 500);
		}

		// Clean markdown code blocks if present
		const cleaned = content.replace(/```json\n?|```/g, "").trim();

		const config = JSON.parse(cleaned);
		return c.json(config);
	} catch (error) {
		console.error("Generation Error:", error);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default app;
