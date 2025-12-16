import { AlertCircle, Gamepad2 } from "lucide-react";
import { useState } from "react";
import GameView from "./components/GameView";
import PromptInput from "./components/PromptInput";
import type { GeneratedGame } from './templates/runner';

function App() {
	const [loading, setLoading] = useState(false);
	const [config, setConfig] = useState<GeneratedGame | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGenerate = async (prompt: string) => {
		setLoading(true);
		setError(null);
		setConfig(null);
		try {
			const res = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt }),
			});
			if (!res.ok) throw new Error("Generation failed");
			const data = await res.json();
			setConfig(data);
		} catch (err) {
			alert("Failed to generate game");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center font-sans">
			<header className="w-full p-6 flex items-center justify-center gap-2 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
				<Gamepad2 className="w-8 h-8 text-purple-500" />
				<span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
					P5Canvas
				</span>
			</header>

			<main className="flex-1 w-full max-w-5xl p-6 flex flex-col gap-8">
				<div className="text-center space-y-2 py-10">
					<h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
						Dream it. Play it.
					</h1>
					<p className="text-gray-400 text-lg max-w-xl mx-auto">
						Describe a simple 2D game and watch it come to life instantly.
					</p>
				</div>

				<PromptInput onSubmit={handleGenerate} isLoading={loading} />

				{loading && (
					<div className="flex justify-center items-center py-20 animate-pulse">
						<div className="text-xl font-light text-purple-300">
							Generating your game...
						</div>
					</div>
				)}

				{error && (
					<div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
						<AlertCircle className="w-5 h-5" />
						<span>{error}</span>
					</div>
				)}

				{config && !loading && (
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
						<GameView config={config} />
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
