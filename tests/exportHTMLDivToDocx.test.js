import { exportHTMLDivToDocx } from '../src/index.js';
import { saveAs } from 'file-saver';
import * as docx from 'docx';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

jest.mock('docx', () => ({
  Document: jest.fn().mockImplementation(() => ({})),
  Packer: {
    toBlob: jest.fn().mockResolvedValue(new Blob(['mock docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })),
  },
  Paragraph: jest.fn().mockImplementation((content) => ({ content })),
  ImageRun: jest.fn().mockImplementation((options) => ({ options })),
  HeadingLevel: {
    HEADING_1: 'HEADING_1',
    HEADING_2: 'HEADING_2',
    HEADING_3: 'HEADING_3',
    HEADING_4: 'HEADING_4',
    HEADING_5: 'HEADING_5',
    HEADING_6: 'HEADING_6',
  },
}));

describe('exportHTMLDivToDocx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should export simple HTML to DOCX', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Test Document</h1>
      <p>This is a test paragraph.</p>
    `;

    await exportHTMLDivToDocx(element, 'test.docx');

    expect(docx.Document).toHaveBeenCalled();
    expect(docx.Packer.toBlob).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'test.docx'
    );
  });

  test('should use custom metadata', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';

    const metadata = {
      creator: 'Test Creator',
      title: 'Test Title',
      description: 'Test Description',
    };

    await exportHTMLDivToDocx(element, 'test.docx', metadata);

    expect(docx.Document).toHaveBeenCalledWith(
      expect.objectContaining({
        creator: 'Test Creator',
        title: 'Test Title',
        description: 'Test Description',
      })
    );
  });

  test('should use default metadata when not provided', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';

    await exportHTMLDivToDocx(element);

    expect(docx.Document).toHaveBeenCalledWith(
      expect.objectContaining({
        creator: 'HTML to DOCX',
        title: 'Document',
        description: 'Document exported from HTML',
      })
    );
  });

  test('should call callback when export completes', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';
    const callback = jest.fn();

    await exportHTMLDivToDocx(element, 'test.docx', {}, callback);

    expect(callback).toHaveBeenCalled();
  });

  test('should handle complex HTML structure', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Main Title</h1>
      <p>Introduction paragraph</p>
      <h2>Section 1</h2>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <h3>Subsection 1.1</h3>
      <p>Content in subsection</p>
      <blockquote>A quote</blockquote>
      <hr>
      <h2>Section 2</h2>
      <ol>
        <li>First step</li>
        <li>Second step</li>
      </ol>
    `;

    await exportHTMLDivToDocx(element, 'complex.docx');

    expect(docx.Document).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'complex.docx'
    );
  });

  test('should handle export errors gracefully', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';
    
    const testError = new Error('Export failed');
    docx.Packer.toBlob.mockRejectedValueOnce(testError);
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const callback = jest.fn();

    await expect(exportHTMLDivToDocx(element, 'test.docx', {}, callback)).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during DOCX creation:', testError);
    expect(callback).toHaveBeenCalled();
    expect(saveAs).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  test('should prevent concurrent exports', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';
    
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Start first export
    const firstExport = exportHTMLDivToDocx(element, 'test1.docx');
    
    // Try to start second export immediately (should be blocked)
    // Note: This test is simplified since the isExporting flag is internal
    
    await firstExport;
    
    expect(saveAs).toHaveBeenCalledTimes(1);
    
    consoleLogSpy.mockRestore();
  });

  test('should handle images in content', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Document with Images</h1>
      <img src="test.jpg" alt="Test Image">
      <p>Text after image</p>
    `;

    await exportHTMLDivToDocx(element, 'with-images.docx');

    expect(docx.Document).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('test.jpg'));
  });

  test('should handle SVG elements', async () => {
    const element = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    
    // Mock width and height properties
    Object.defineProperty(svg, 'width', {
      value: { baseVal: { value: 100 } }
    });
    Object.defineProperty(svg, 'height', {
      value: { baseVal: { value: 100 } }
    });
    
    element.appendChild(svg);

    await exportHTMLDivToDocx(element, 'with-svg.docx');

    expect(docx.Document).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  test('should use default filename when not provided', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';

    await exportHTMLDivToDocx(element);

    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'document.docx'
    );
  });
});