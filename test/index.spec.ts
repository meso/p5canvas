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
							initialState: { score: 0 },
							update: "state.score++",
							draw: "p.text(state.score, 10, 10)",
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
		const data: any = await response.json();
		expect(data).toHaveProperty("initialState");
		expect(data.initialState).toHaveProperty("score", 0);

		fetchSpy.mockRestore();
	});

	it("POST /api/generate handles upstream API 500 error", async () => {
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("Internal Server Error", { status: 500 }));

		const request = new Request("http://example.com/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt: "Test game" }),
		});
		const ctx = createExecutionContext();
		const testEnv = { ...env, OPENROUTER_API_KEY: "test-key" };
		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(500);
		const data: any = await response.json();
		expect(data).toHaveProperty("error", "LLM API Error");

		fetchSpy.mockRestore();
	});

	it("POST /api/generate handles invalid JSON from upstream", async () => {
		const mockOpenRouterResponse = {
			choices: [
				{
					message: {
						content: "This is not JSON",
					},
				},
			],
		};

		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(JSON.stringify(mockOpenRouterResponse)));

		const request = new Request("http://example.com/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt: "Test game" }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, { ...env, OPENROUTER_API_KEY: "k" }, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(500); // Or 200 with error? Logic says: console.error and return c.json({error: "Internal..."})?
		// Reviewing code: index.tsx catches JSON.parse error and returns 500.
		const data: any = await response.json();
		expect(data).toHaveProperty("error", "Internal Server Error");

		fetchSpy.mockRestore();
	});

	it("POST /api/generate handles empty choices from upstream", async () => {
		const mockOpenRouterResponse = {
			choices: [],
		};

		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(JSON.stringify(mockOpenRouterResponse)));

		const request = new Request("http://example.com/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt: "Test game" }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, { ...env, OPENROUTER_API_KEY: "k" }, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(500);
		const data: any = await response.json();
		expect(data).toHaveProperty("error", "Empty response from LLM");

		fetchSpy.mockRestore();
	});
});
