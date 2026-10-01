import '@testing-library/jest-dom';

// Mock Web Audio API for tests
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }
  destination = {};
  resume() {
    return Promise.resolve();
  }
}

// Polyfill window.crypto for test runner if needed
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '00000000-0000-0000-0000-000000000001',
      getRandomValues: <T extends ArrayBufferView>(array: T): T => array,
    },
  });
}

// @ts-expect-error test mock
window.AudioContext = MockAudioContext;
// @ts-expect-error test mock
window.webkitAudioContext = MockAudioContext;
