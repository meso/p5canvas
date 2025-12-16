import { Sandpack } from "@codesandbox/sandpack-react";
import type React from "react";
import { generateIndexJs, type GeneratedGame } from "../templates/runner";

interface GameViewProps {
	config: GeneratedGame; // Renamed from config to generic, but keeping prop name
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
	// Generate the full p5.js code string from the config (which contains code fragments)
	const indexJsCode = generateIndexJs(config);

	const files = {
		"/index.html": INDEX_HTML,
		"/index.js": indexJsCode,
		// We can still keep config.json for debugging transparency if we want
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
					showTabs: false,
					externalResources: [
						"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js",
					],
					classes: {
						"sp-layout": "!h-full",
						"sp-wrapper": "!h-full",
						"sp-preview": "!h-full",
					},
				}}
			/>
		</div>
	);
};

export default GameView;
