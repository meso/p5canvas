
// runner.ts
// This function constructs a p5.js instance mode function from generated code.

export interface GeneratedGame {
  initialState: Record<string, any>;
  setup: string;  // Function body: (state, p) => void - Sprite initialization
  update: string; // Function body: (state, p) => void
  draw: string;   // Function body: (state, p) => void
  mousePressed?: string; // Optional function body: (state, p) => void
  keyPressed?: string;   // Optional function body: (state, p) => void
  touchStarted?: string; // Optional function body: (state, p) => void
  touchEnded?: string;   // Optional function body: (state, p) => void
}

export const createSketch = (game: GeneratedGame) => {
  return (p: any) => {
    let state: any = null;
    let updateFunc: Function | null = null;
    let drawFunc: Function | null = null;
    let error: Error | null = null;

    p.setup = () => {
      // Fixed 640x480 resolution (scaled by CSS)
      p.createCanvas(640, 480);

      try {
        // Deep copy initial state to avoid mutation reference issues on restart
        state = JSON.parse(JSON.stringify(game.initialState));

        // Create functions from strings
        // new Function(arg1, arg2, body)
        updateFunc = new Function('state', 'p', game.update);
        drawFunc = new Function('state', 'p', game.draw);

      } catch (e: any) {
        error = e;
        console.error("Setup Error:", e);
      }
    };

    p.draw = () => {
      if (error) {
        p.background(50, 0, 0);
        p.fill(255);
        p.textSize(16);
        p.text("Runtime Error:\n" + error.message, 20, 40);
        p.noLoop();
        return;
      }

      try {
        // Safety check
        if (!state || !updateFunc || !drawFunc) return;

        // Execute update
        updateFunc(state, p);

        // Execute draw
        p.push();
        drawFunc(state, p);
        p.pop();

      } catch (e: any) {
        error = e;
        console.error("Runtime Error:", e);
      }
    };

    p.windowResized = () => {
      // No-op or custom resize logic if needed
    };
  };
};

// Helper to convert the sketch function to a string that can be injected into Sandpack
export const generateIndexJs = (gameConfig: GeneratedGame) => {
  // Serialize initialState
  const initialStateStr = JSON.stringify(gameConfig.initialState);

  return `
new p5((p) => {
  let state = null;
  let updateFunc = null;
  let drawFunc = null;
  let setupFunc = null;
  let error = null;

  const initialState = ${initialStateStr};

  p.setup = function() {
    // Dynamic resolution filling the container strictly
    // Use document.documentElement.clientWidth to get strict viewport width excluding scrollbars
    const getWidth = () => Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const getHeight = () => Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);

    try {
      // Check if p5play is loaded
      if (typeof p.Sprite === 'undefined') {
        throw new Error('p5play library not loaded');
      }

      // Cleanup existing sprites
      if (p.allSprites) {
        p.allSprites.removeAll();
      }

      p.frameRate(60);

      // Deep copy initial state
      state = JSON.parse(JSON.stringify(initialState));

      // Create setup function and execute it (LLM creates Canvas here)
      setupFunc = new Function('state', 'p', ${JSON.stringify(gameConfig.setup)});
      setupFunc(state, p);

      // Create functions from generated bodies
      updateFunc = new Function('state', 'p', ${JSON.stringify(gameConfig.update)});
      drawFunc = new Function('state', 'p', ${JSON.stringify(gameConfig.draw)});

      ${gameConfig.mousePressed ? `state.mousePressed = new Function('state', 'p', ${JSON.stringify(gameConfig.mousePressed)});` : ''}
      ${gameConfig.keyPressed ? `state.keyPressed = new Function('state', 'p', ${JSON.stringify(gameConfig.keyPressed)});` : ''}
      ${gameConfig.touchStarted ? `state.touchStarted = new Function('state', 'p', ${JSON.stringify(gameConfig.touchStarted)});` : ''}
      ${gameConfig.touchEnded ? `state.touchEnded = new Function('state', 'p', ${JSON.stringify(gameConfig.touchEnded)});` : ''}

    } catch (e) {
      error = e;
      console.error("Setup Error:", e);
    }
  };

  p.draw = function() {
    if (error) {
      p.background(50, 0, 0);
      p.fill(255);
      p.textSize(16);
      p.text("Runtime Error:\\n" + error.message, 20, 40);
      p.noLoop();
      return;
    }

    try {
      if (!state || !updateFunc || !drawFunc) return;
      
      // Execute update
      updateFunc(state, p);
      
      // Execute draw
      p.push(); // Save style/transform state
      drawFunc(state, p);
      p.pop(); // Restore state to prevent leakage to next frame

    } catch (e) {
      error = e;
      console.error("Runtime Error:", e);
    }
  };

  p.windowResized = function() {
    const w = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const h = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);
    p.resizeCanvas(w, h);
  };

  // Event handlers
  p.mousePressed = function() {
    if (state && typeof state.mousePressed === 'function') {
      try {
        state.mousePressed(state, p);
      } catch (e) {
        console.error("MousePressed Error:", e);
      }
    }
  };

  p.keyPressed = function() {
    if (state && typeof state.keyPressed === 'function') {
      try {
        state.keyPressed(state, p);
      } catch (e) {
        console.error("KeyPressed Error:", e);
      }
    }
  };

  p.touchStarted = function() {
    if (state && typeof state.touchStarted === 'function') {
      try {
        state.touchStarted(state, p);
        return false; // prevent default behavior
      } catch (e) {
        console.error("TouchStarted Error:", e);
      }
    } else {
      p.mousePressed();
    }
  };

  p.touchEnded = function() {
    if (state && typeof state.touchEnded === 'function') {
      try {
        state.touchEnded(state, p);
        return false;
      } catch (e) {
        console.error("TouchEnded Error:", e);
      }
    }
  };
});
`;
};
