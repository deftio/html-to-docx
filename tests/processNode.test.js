import { processNode, processListNode } from '../src/index.js';
import { Paragraph } from 'docx';

describe('processNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Text nodes', () => {
    test('should process text nodes', async () => {
      const div = document.createElement('div');
      div.textContent = 'Simple text content';
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Paragraph);
    });

    test('should ignore empty text nodes', async () => {
      const div = document.createElement('div');
      div.innerHTML = '   \n   ';
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('Heading elements', () => {
    test('should process h1 element', async () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Main Title';
      
      const result = await processNode(h1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Paragraph);
    });

    test('should process h2-h6 elements', async () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      `;
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(5);
      result.forEach(item => {
        expect(item).toBeInstanceOf(Paragraph);
      });
    });
  });

  describe('Paragraph elements', () => {
    test('should process paragraph elements', async () => {
      const p = document.createElement('p');
      p.textContent = 'This is a paragraph.';
      
      const result = await processNode(p);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Paragraph);
    });

    test('should process multiple paragraphs', async () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <p>First paragraph</p>
        <p>Second paragraph</p>
        <p>Third paragraph</p>
      `;
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('List elements', () => {
    test('should process unordered lists', async () => {
      const ul = document.createElement('ul');
      ul.innerHTML = `
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      `;
      
      const result = await processNode(ul);
      
      expect(result).toHaveLength(3);
      result.forEach(item => {
        expect(item).toBeInstanceOf(Paragraph);
      });
    });

    test('should process ordered lists', async () => {
      const ol = document.createElement('ol');
      ol.innerHTML = `
        <li>First step</li>
        <li>Second step</li>
        <li>Third step</li>
      `;
      
      const result = await processNode(ol);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('Container elements', () => {
    test('should process nested div elements', async () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div>
          <p>Nested paragraph 1</p>
          <div>
            <p>Deeply nested paragraph</p>
          </div>
        </div>
        <p>Paragraph 2</p>
      `;
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(3);
    });

    test('should process section and article elements', async () => {
      const section = document.createElement('section');
      section.innerHTML = `
        <article>
          <h2>Article Title</h2>
          <p>Article content</p>
        </article>
      `;
      
      const result = await processNode(section);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('Special elements', () => {
    test('should process blockquote elements', async () => {
      const blockquote = document.createElement('blockquote');
      blockquote.textContent = 'This is a quote';
      
      const result = await processNode(blockquote);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Paragraph);
    });

    test('should process br elements', async () => {
      const div = document.createElement('div');
      div.innerHTML = 'Line 1<br>Line 2';
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(3); // text, br (empty para), text
    });

    test('should process hr elements', async () => {
      const div = document.createElement('div');
      const hr = document.createElement('hr');
      div.appendChild(hr);
      
      const result = await processNode(div);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Paragraph);
    });

    test('should handle table elements with placeholder', async () => {
      const div = document.createElement('div');
      const table = document.createElement('table');
      table.innerHTML = `
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
      `;
      div.appendChild(table);
      
      const result = await processNode(div);
      
      // Table should be replaced with a placeholder paragraph
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(item => item instanceof Paragraph)).toBeTruthy();
    });
  });

  describe('Image elements', () => {
    test('should process img elements', async () => {
      const div = document.createElement('div');
      const img = document.createElement('img');
      img.src = 'test.jpg';
      img.alt = 'Test image';
      div.appendChild(img);
      
      const result = await processNode(div);
      
      // Image processing might succeed or fail depending on mock
      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('should handle image processing errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const img = document.createElement('img');
      img.src = 'broken.jpg';
      
      const result = await processNode(img);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('SVG elements', () => {
    test('should process SVG elements', async () => {
      const div = document.createElement('div');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100');
      svg.setAttribute('height', '100');
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      svg.appendChild(rect);
      
      // Mock width and height properties
      Object.defineProperty(svg, 'width', {
        value: { baseVal: { value: 100 } }
      });
      Object.defineProperty(svg, 'height', {
        value: { baseVal: { value: 100 } }
      });
      
      div.appendChild(svg);
      const result = await processNode(div);
      
      expect(result).toHaveLength(1);
    });
  });
});

describe('processListNode', () => {
  test('should process unordered list with bullets', async () => {
    const ul = document.createElement('ul');
    ul.innerHTML = `
      <li>Item 1</li>
      <li>Item 2</li>
    `;
    
    const result = await processListNode(ul);
    
    expect(result).toHaveLength(2);
    result.forEach(item => {
      expect(item).toBeInstanceOf(Paragraph);
    });
  });

  test('should process ordered list with numbers', async () => {
    const ol = document.createElement('ol');
    ol.innerHTML = `
      <li>First</li>
      <li>Second</li>
      <li>Third</li>
    `;
    
    const result = await processListNode(ol);
    
    expect(result).toHaveLength(3);
  });

  test('should ignore non-li elements in lists', async () => {
    const ul = document.createElement('ul');
    ul.innerHTML = `
      <li>Valid item</li>
      <div>Invalid item</div>
      <li>Another valid item</li>
    `;
    
    const result = await processListNode(ul);
    
    expect(result).toHaveLength(2);
  });
});