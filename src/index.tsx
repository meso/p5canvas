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

	const systemPrompt = `You are a creative p5.js game generator.
Your goal is to generate a runnable p5.js game based on the user's prompt.
Output ONLY a JSON object with the following structure. Do NOT output markdown.

{
  "initialState": { ... }, // Dictionary of all mutable state variables (e.g., player position, score, enemies array).
  "update": "...", // JavaScript code string for the update logic (runs 60fps). Function signature: (state, p).
                  // 'state' is the mutable state object. 'p' is the p5 instance.
                  // Example: "state.x += state.vx; if (state.x > p.width) state.vx *= -1;"
  "draw": "..."   // JavaScript code string for the draw logic. Function signature: (state, p).
                  // Use 'p' for drawing commands (e.g., p.background(0); p.circle(state.x, state.y, 20);).
                  // Do NOT call update() here, it is handled by the runner.
}

Rules:
1. Use 'p' for all p5.js functions/constants (e.g., p.width, p.height, p.LEFT_ARROW, p.fill()).
2. Do NOT declare global variables. Store EVERYTHING in 'initialState'.
3. The 'update' and 'draw' strings will be executed as function bodies.
4. Ensure valid JSON format. specific keys: "initialState", "update", "draw".
5. USE EMOJIS for visual elements! Instead of plain circles or rects, use p.text("🍎", x, y) or "🚀". It makes games fun!
6. For user interaction, you can optionally include "mousePressed" or "keyPressed" strings in the JSON.
   - "mousePressed": Code to run when mouse is clicked. (e.g., "if (state.gameOver) initGame();")
   - "keyPressed": Code to run when a key is pressed. (e.g., "if (p.keyCode === p.UP_ARROW) state.dir = 'up';")
`;

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
					model: "mistralai/devstral-2512:free",
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
