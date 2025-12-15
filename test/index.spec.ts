import {
	createExecutionContext,
	env,
	SELF,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import worker from "../src/index";

describe("P5Canvas API", () => {
	it("POST /api/generate returns error for missing prompt", async () => {
		const request = new Request("http://example.com/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(400); // Expect Bad Request
	});

	it("POST /api/generate calls OpenRouter and returns config", async () => {
		const mockOpenRouterResponse = {
			choices: [
				{
					message: {
						content: JSON.stringify({
							gameType: "breakout",
							ballSpeed: 5,
							paddleWidth: 100,
							blockRows: 3,
							enemyColor: "red",
							difficulty: "easy",
						}),
					},
				},
			],
		};

		// Mock global fetch used by the worker
		// Note: verification of fetch arguments would be better
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(JSON.stringify(mockOpenRouterResponse)));

		const request = new Request("http://example.com/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt: "Test game" }),
		});
		const ctx = createExecutionContext();
		const testEnv = { ...env, OPENROUTER_API_KEY: "test-key" };
		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty("ballSpeed", 5);

		fetchSpy.mockRestore();
	});

	// We can't easily test success without mocking LLM yet,
	// but we can test that the route exists and validates input.
});
