import { svgToPng } from '../src/index.js';

describe('svgToPng', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should convert SVG element to PNG blob', async () => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '100');
    svgElement.setAttribute('height', '100');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');
    rect.setAttribute('fill', 'red');
    svgElement.appendChild(rect);

    const result = await svgToPng(svgElement);
    
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });

  test('should handle SVG with text elements', async () => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '200');
    svgElement.setAttribute('height', '200');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '100');
    text.setAttribute('y', '100');
    text.textContent = 'Test Text';
    svgElement.appendChild(text);

    const result = await svgToPng(svgElement);
    
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });

  test('should serialize SVG correctly', async () => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgElement.setAttribute('width', '50');
    svgElement.setAttribute('height', '50');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '25');
    circle.setAttribute('cy', '25');
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', 'blue');
    svgElement.appendChild(circle);

    const result = await svgToPng(svgElement);
    
    expect(result).toBeDefined();
    expect(result.size).toBeGreaterThan(0);
  });
});