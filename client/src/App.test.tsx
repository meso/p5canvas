import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock child components to verify integration
vi.mock("./components/PromptInput", () => ({
	default: ({
		onSubmit,
		isLoading,
	}: {
		onSubmit: (p: string) => void;
		isLoading: boolean;
	}) => (
		<div data-testid="prompt-input">
			<button
				type="button"
				data-testid="submit-btn"
				onClick={() => onSubmit("test prompt")}
				disabled={isLoading}
			>
				Submit
			</button>
			{isLoading && <span>Loading...</span>}
		</div>
	),
}));

vi.mock("./components/GameView", () => ({
	default: ({ config }: { config: any }) => (
		<div data-testid="game-view">{JSON.stringify(config)}</div>
	),
}));

describe("App Integration", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		global.fetch = vi.fn();
	});

	it("renders PromptInput initially", () => {
		render(<App />);
		expect(screen.getByTestId("prompt-input")).toBeInTheDocument();
		expect(screen.queryByTestId("game-view")).not.toBeInTheDocument();
	});

	it('handles generation flow', async () => {
		const mockConfig = {
			initialState: { x: 0 },
			update: "state.x++",
			draw: "p.circle(state.x, 0, 10)"
		};
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => mockConfig
		});

		render(<App />);

		// Simulate submit
		fireEvent.click(screen.getByTestId("submit-btn"));

		// Check loading state (PromptInput mock renders "Loading..." via props)
		expect(screen.getByText("Loading...")).toBeInTheDocument();

		// Wait for API call and GameView
		await waitFor(() => {
			expect(screen.getByTestId("game-view")).toBeInTheDocument();
		});

		expect(screen.getByTestId("game-view")).toHaveTextContent('"x":0');
		expect(global.fetch).toHaveBeenCalledWith(
			"/api/generate",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ prompt: "test prompt" }),
			}),
		);
	});

	it("handles API error", async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			text: async () => "Error",
		});

		render(<App />);
		const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => { });

		fireEvent.click(screen.getByTestId("submit-btn"));

		await waitFor(() => {
			expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
		});

		expect(alertSpy).toHaveBeenCalled();
		expect(screen.queryByTestId("game-view")).not.toBeInTheDocument();
		alertSpy.mockRestore();
	});
});
