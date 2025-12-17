import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GameView from "./GameView";

// Mock individual components
vi.mock("@codesandbox/sandpack-react", () => ({
	SandpackProvider: ({ children, files, options }: any) => (
		<div data-testid="sandpack-provider">
			<div data-testid="sp-options">{JSON.stringify(options)}</div>
			<div data-testid="sp-files">{Object.keys(files || {}).join(',')}</div>
			{children}
		</div>
	),
	SandpackLayout: ({ children, className }: any) => (
		<div data-testid="sandpack-layout" className={className}>{children}</div>
	),
	SandpackPreview: ({ className }: any) => (
		<div data-testid="sandpack-preview" className={className}>Preview</div>
	),
	SandpackCodeEditor: ({ className }: any) => (
		<div data-testid="sandpack-code-editor" className={className}>Editor</div>
	),
}));

describe('GameView', () => {
	it('renders with Game tab active by default (Preview visible, Editor hidden)', () => {
		const config = { initialState: {}, update: "", draw: "" };
		render(<GameView config={config} />);

		// Check for Provider
		expect(screen.getByTestId('sandpack-provider')).toBeInTheDocument();

		// Check for Tabs
		expect(screen.getByText('Game')).toBeInTheDocument();
		expect(screen.getByText('Code')).toBeInTheDocument();

		// Check default visibility
		expect(screen.getByTestId('sandpack-preview')).toBeInTheDocument();
		expect(screen.queryByTestId('sandpack-code-editor')).not.toBeInTheDocument();
	});

	it('switches to Code view when tab is clicked', async () => {
		const config = { initialState: {}, update: "", draw: "" };
		const { user } = render(<GameView config={config} />);

		// Click Code tab
		const codeTab = screen.getByText('Code');
		await user.click(codeTab);

		// Expect Editor to be visible now
		expect(screen.getByTestId('sandpack-code-editor')).toBeInTheDocument();
		// Preview might be hidden or kept (depending on implementation, but typically hidden for simple tabs)
		// For now assuming we swap them.
		expect(screen.queryByTestId('sandpack-preview')).not.toBeInTheDocument();
	});

	it('enforces fixed height on container', () => {
		const config = { initialState: {}, update: "", draw: "" };
		render(<GameView config={config} />);

		const container = screen.getByTestId('game-view-container');
		expect(container).toHaveClass('h-[600px]');
	});

	it('passes correct options to SandpackProvider', () => {
		const config = { initialState: {}, update: "", draw: "" };
		render(<GameView config={config} />);

		const optionsDiv = screen.getByTestId('sp-options');
		const options = JSON.parse(optionsDiv.textContent || '{}');

		// Classes should still be there for height control
		expect(options.classes["sp-layout"]).toContain("!h-full");
		expect(options.externalResources).toContain("https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js");
	});
});

function render(ui: React.ReactElement) {
	const user = require('@testing-library/user-event').default.setup();
	return {
		user,
		...require('@testing-library/react').render(ui),
	};
}
