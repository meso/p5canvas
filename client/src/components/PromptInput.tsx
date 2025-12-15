import { Loader2, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface PromptInputProps {
	onSubmit: (prompt: string) => void;
	isLoading?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
	const [prompt, setPrompt] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (prompt.trim()) {
			onSubmit(prompt);
		}
	};

	return (
		<div className="w-full max-w-2xl mx-auto p-6">
			<form onSubmit={handleSubmit} className="relative group">
				<div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
				<div className="relative bg-black/80 backdrop-blur-xl ring-1 ring-white/10 rounded-xl p-4">
					<textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="What kind of game should we make? (e.g., 'A fast breakout game with red blocks')"
						className="w-full bg-transparent text-white placeholder-gray-400 border-none focus:ring-0 resize-none min-h-[100px] text-lg font-light leading-relaxed"
						disabled={isLoading}
					/>
					<div className="flex justify-between items-center mt-4">
						<div className="flex gap-2">
							{/* Decorative tags or hints could go here */}
							<span className="px-3 py-1 bg-white/5 rounded-full text-xs text-blue-200 font-medium border border-white/10">
								AI Powered
							</span>
						</div>
						<button
							type="submit"
							disabled={isLoading || !prompt.trim()}
							className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4" />
									Generate Game
								</>
							)}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default PromptInput;
