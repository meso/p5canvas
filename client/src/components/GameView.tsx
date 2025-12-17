import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview
} from "@codesandbox/sandpack-react";
import React, { useState } from "react";
import { generateIndexJs, type GeneratedGame } from "../templates/runner";
import { Code2, Play } from "lucide-react";

interface GameViewProps {
  config: GeneratedGame;
}

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
      canvas { display: block; position: absolute; top: 0; left: 0; outline: none; }
    </style>
  </head>
  <body>
    <script src="index.js"></script>
    <script src="consoleHook.js"></script>
  </body>
</html>
`;

const GameView: React.FC<GameViewProps> = ({ config }) => {
  const indexJsCode = React.useMemo(() => generateIndexJs(config), [config]);
  const [viewMode, setViewMode] = useState<'game' | 'code'>('game');

  const files = React.useMemo(() => ({
    "/index.html": INDEX_HTML,
    "/index.js": indexJsCode,
    "/config.json": JSON.stringify(config, null, 2),
  }), [indexJsCode, config]);

  const options = React.useMemo(() => ({
    activeFile: "/index.js",
    externalResources: [
      "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js",
    ],
    classes: {
      "sp-layout": "!h-full",
      "sp-wrapper": "!h-full",
      "sp-preview": "!h-full",
      "sp-editor": "!h-full",
    },
  }), []);

  return (
    <div data-testid="game-view-container" className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl bg-[#0f0f0f] border border-white/5 relative flex flex-col">
      <SandpackProvider
        files={files}
        template="static"
        theme="dark"
        options={options}
      >
        <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between bg-white/5">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('game')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'game'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Play className="w-4 h-4" />
              Game
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'code'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Code2 className="w-4 h-4" />
              Code
            </button>
          </div>
        </div>

        <div className="absolute top-12 bottom-0 left-0 right-0">
          <SandpackLayout className="!h-full !border-none" style={{ height: '100%' }}>
            {viewMode === 'game' ? (
              <SandpackPreview
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showRefreshButton={true}
                showRestartButton={true}
                className="!h-full"
                style={{ height: '100%' }}
              />
            ) : (
              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                wrapContent
                closableTabs={false}
                className="!h-full"
                style={{ height: '100%' }}
              />
            )}
          </SandpackLayout>
        </div>
      </SandpackProvider>
    </div>
  );
};

export default GameView;
