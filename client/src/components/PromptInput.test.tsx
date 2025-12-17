import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PromptInput from "./PromptInput";

describe("PromptInput", () => {
	it("renders textarea and button", () => {
		render(<PromptInput onSubmit={vi.fn()} />);
		expect(
			screen.getByPlaceholderText(/What kind of game/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /generate/i }),
		).toBeInTheDocument();
	});

	it("calls onSubmit with user input", () => {
		const handleSubmit = vi.fn();
		render(<PromptInput onSubmit={handleSubmit} />);

		const textarea = screen.getByPlaceholderText(/What kind of game/i);
		fireEvent.change(textarea, { target: { value: "breakout game" } });

		const button = screen.getByRole("button", { name: /generate/i });
		fireEvent.click(button);

		expect(handleSubmit).toHaveBeenCalledWith("breakout game");
	});

	it("disables button when loading", () => {
		render(<PromptInput onSubmit={vi.fn()} isLoading={true} />);
		expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled();
	});

	it("does not call onSubmit when input is empty", () => {
		const handleSubmit = vi.fn();
		render(<PromptInput onSubmit={handleSubmit} />);

		const button = screen.getByRole("button", { name: /generate/i });
		expect(button).toBeDisabled();

		// Try forcing form submission
		const form = button.closest('form');
		if (form) fireEvent.submit(form);

		expect(handleSubmit).not.toHaveBeenCalled();
	});
});
