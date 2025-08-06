// Mock Canvas API for SVG to PNG conversion
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
}));

HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  const blob = new Blob(['mock png data'], { type: 'image/png' });
  blob.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
  callback(blob);
});

// Mock Image loading
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.width = 100;
      this.height = 100;
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
  set src(value) {
    this._src = value;
  }
  get src() {
    return this._src;
  }
};

// Mock fetch for images
global.fetch = jest.fn((url) => {
  return Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  });
});

// Mock saveAs from file-saver
global.saveAs = jest.fn();