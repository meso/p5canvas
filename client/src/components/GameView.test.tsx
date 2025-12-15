import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GameView from "./GameView";

// Mock Sandpack since it's heavy and uses iframes
vi.mock("@codesandbox/sandpack-react", () => ({
	Sandpack: vi.fn(({ files }) => (
		<div data-testid="sandpack-mock">
			{Object.keys(files).map((filename) => (
				<div key={filename} data-testid={`file-${filename}`}>
					{filename}
				</div>
			))}
		</div>
	)),
}));

describe("GameView", () => {
	it("renders sandpack with correct files", () => {
		const config = { gameType: "breakout", ballSpeed: 5 };
		render(<GameView config={config} />);

		expect(screen.getByTestId("sandpack-mock")).toBeInTheDocument();
		// Should have index.html, index.js, and config.json
		expect(screen.getByTestId("file-/index.html")).toBeInTheDocument();
		expect(screen.getByTestId("file-/index.js")).toBeInTheDocument();
		expect(screen.getByTestId("file-/config.json")).toBeInTheDocument();
	});
});
