import { describe, it, expect } from 'vitest';
import { generateIndexJs, type GeneratedGame } from './runner';

describe('generateIndexJs', () => {
  it('should include touch/key event handlers if provided in config', () => {
    const game: GeneratedGame = {
      initialState: {},
      update: '',
      draw: '',
      touchStarted: 'console.log("touch")',
      touchEnded: 'console.log("end")',
      keyPressed: 'console.log("key")'
    };

    const code = generateIndexJs(game);

    expect(code).toContain('p.touchStarted = function');
    expect(code).toContain('p.touchEnded = function');
    expect(code).toContain('p.keyPressed = function');
    expect(code).toContain('state.touchStarted = new Function');
    expect(code).toContain('state.touchStarted = new Function');
    expect(code).toContain('state.touchEnded = new Function');
  });

  it('should generate Instance Mode code to avoid globals', () => {
    const game: GeneratedGame = {
      initialState: {},
      update: '',
      draw: ''
    };
    const code = generateIndexJs(game);
    // Check for Instance Mode wrapper
    expect(code).toContain('new p5((p) => {');
    // Check for local state declaration (no var/const global issues)
    expect(code).toContain('let state =');
    // Check for p.setup and p.draw
    expect(code).toContain('p.setup = function() {');
    expect(code).toContain('p.draw = function() {');
    // Check that updateFunc and drawFunc are both called
    expect(code).toContain('updateFunc(state, p)');
    expect(code).toContain('p.push();');
    expect(code).toContain('drawFunc(state, p)');
    expect(code).toContain('p.pop();');
    // Check for p.createCanvas usage with new dynamic sizing
    expect(code).toContain('p.createCanvas(getWidth(), getHeight())');
    // Check for frameRate cap
    expect(code).toContain('p.frameRate(60)');
  });

  it('should correctly handle template literals in function bodies', () => {
    const game: GeneratedGame = {
      initialState: { score: 10 },
      update: 'console.log(`Score: ${state.score}`)',
      draw: ''
    };
    const code = generateIndexJs(game);

    // The generated code should NOT evaluate ${state.score} during generation
    // It should preserve the backticks and interpolation for runtime
    // Using JSON.stringify approach: "new Function(..., \"console.log(`Score: ${state.score}`)\")"
    // The previous implementation used backticks wrapper: `new Function(..., \`console.log(\\\`Score: ${state.score}\\\`)\`)`
    // which causes eager interpolation if not escaped.

    // We expect the output to contain the literal string representing the code
    expect(code).toContain('console.log(`Score: ${state.score}`)');

    // And it should be valid JS syntax (difficult to fully verify without parsing, but checking for eager eval artifacts)
    // If eager eval happened, it might look like: console.log(`Score: 10`) (if state matches) or crash.
  });
});
