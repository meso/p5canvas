
// runner.ts
// This function constructs a p5.js instance mode function from generated code.

export interface GeneratedGame {
  initialState: Record<string, any>;
  update: string; // Function body: (state, p) => void
  draw: string;   // Function body: (state, p) => void
}

export const createSketch = (game: GeneratedGame) => {
  return (p: any) => {
    let state: any = null;
    let updateFunc: Function | null = null;
    let drawFunc: Function | null = null;
    let error: Error | null = null;

    p.setup = () => {
      // Create a responsive canvas
      // We'll rely on the parent container to size it, or just use window size for now
      // Since Sandpack iframe is small, windowWidth/Height works well usually
      p.createCanvas(p.windowWidth, p.windowHeight);

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
        drawFunc(state, p);

      } catch (e: any) {
        error = e;
        console.error("Runtime Error:", e);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
};

// Helper to convert the sketch function to a string that can be injected into Sandpack
export const generateIndexJs = (gameConfig: GeneratedGame) => {
  // We need to inject the raw code strings into the template.
  // Instead of importing createSketch (which isn't in Sandpack), 
  // we will essentially "inline" the logic above into the string we return.

  // Serialize initialState
  const initialStateStr = JSON.stringify(gameConfig.initialState);

  return `
let state = null;
let updateFunc = null;
let drawFunc = null;
let error = null;

const initialState = ${initialStateStr};

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  try {
    state = JSON.parse(JSON.stringify(initialState));
    
    // Create functions from generated bodies
    updateFunc = new Function('state', 'p', \`${gameConfig.update.replace(/`/g, '\\`')}\`);
    drawFunc = new Function('state', 'p', \`${gameConfig.draw.replace(/`/g, '\\`')}\`);
    
  } catch (e) {
    error = e;
    console.error("Setup Error:", e);
  }
}

function draw() {
  if (error) {
    background(50, 0, 0);
    fill(255);
    textSize(16);
    text("Runtime Error:\\n" + error.message, 20, 40);
    noLoop();
    return;
  }

  try {
    if (!state || !updateFunc || !drawFunc) return;

    // In global mode, 'p' is technically 'window' or 'this', 
    // but p5 functions are global.
    // However, our generated code expects 'p' as an argument for instance mode compatibility.
    // To support global mode Sandpack sketch, we can pass 'window' as 'p'.
    // OR, better, we simply instruct the LLM to use 'p.' prefixes and we pass 'this' or a proxy.
    // Actually, in global mode p5, 'width' is available, 'p.width' is not unless we define p.
    
    // WAIT. The system prompt instructs to use 'p.width'.
    // So if we run in global mode (standard index.js), we need to define 'p'.
    const p = window; 
    
    // Execute update
    updateFunc(state, p);

    // Execute draw
    drawFunc(state, p);

  } catch (e) {
    error = e;
    console.error("Runtime Error:", e);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
`;
};
