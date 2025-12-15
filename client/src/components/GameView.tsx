import { Sandpack } from "@codesandbox/sandpack-react";
import type React from "react";
import { BREAKOUT_CODE } from "../templates/breakout";

interface GameConfig {
	gameType?: string;
	ballSpeed?: number;
	paddleWidth?: number;
	blockRows?: number;
	enemyColor?: string;
	difficulty?: string;
	[key: string]: unknown;
}

interface GameViewProps {
	config: GameConfig;
}

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
    <style> body { margin: 0; padding: 0; overflow: hidden; } canvas { display: block; } </style>
  </head>
  <body>
    <script src="index.js"></script>
  </body>
</html>`;

const GameView: React.FC<GameViewProps> = ({ config }) => {
	const files = {
		"/index.html": INDEX_HTML,
		"/index.js": BREAKOUT_CODE,
		"/config.json": JSON.stringify(config, null, 2),
	};

	return (
		<div className="w-full h-[600px] border border-white/20 rounded-xl overflow-hidden shadow-2xl">
			<Sandpack
				template="static"
				theme="dark"
				files={files}
				options={{
					showNavigator: false,
					showTabs: false, // Hide tabs to make it look like a game
					externalResources: [
						"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js",
					],
					classes: {
						"sp-layout": "!h-full",
						"sp-wrapper": "!h-full",
						"sp-preview": "!h-full",
					},
				}}
				customSetup={{
					dependencies: {},
				}}
			/>
		</div>
	);
};

export default GameView;
