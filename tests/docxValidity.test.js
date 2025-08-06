import { exportHTMLDivToDocx } from '../src/index.js';
import { saveAs } from 'file-saver';
import * as docx from 'docx';

jest.mock('file-saver');

describe('DOCX Validity Tests', () => {
  let capturedBlob;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedBlob = null;
    
    // Capture the blob that would be saved
    saveAs.mockImplementation((blob) => {
      capturedBlob = blob;
    });
  });

  test('should generate valid DOCX structure', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Test Document</h1>
      <p>This is a paragraph with some text.</p>
      <h2>Section 1</h2>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;

    await exportHTMLDivToDocx(element, 'test.docx');

    // Verify a blob was created
    expect(capturedBlob).toBeDefined();
    expect(capturedBlob).toBeInstanceOf(Blob);
    
    // Check MIME type
    expect(capturedBlob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Verify the blob has content
    expect(capturedBlob.size).toBeGreaterThan(0);
  });

  test('should create DOCX with proper metadata', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test content</p>';
    
    const metadata = {
      creator: 'Test Suite',
      title: 'Test Document',
      description: 'Document for testing'
    };

    await exportHTMLDivToDocx(element, 'metadata-test.docx', metadata);

    expect(capturedBlob).toBeDefined();
    expect(capturedBlob.size).toBeGreaterThan(0);
  });

  test('should handle complex document structure', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Main Title</h1>
      <p>Introduction paragraph with <strong>bold text</strong>.</p>
      
      <h2>Chapter 1</h2>
      <p>First chapter content.</p>
      
      <h3>Section 1.1</h3>
      <p>Section content with multiple paragraphs.</p>
      <p>Another paragraph in the section.</p>
      
      <h3>Section 1.2</h3>
      <ul>
        <li>Unordered list item 1</li>
        <li>Unordered list item 2</li>
        <li>Unordered list item 3</li>
      </ul>
      
      <h2>Chapter 2</h2>
      <ol>
        <li>Ordered list item 1</li>
        <li>Ordered list item 2</li>
      </ol>
      
      <blockquote>
        This is a blockquote with indented text.
      </blockquote>
      
      <h3>Conclusion</h3>
      <p>Final paragraph of the document.</p>
    `;

    await exportHTMLDivToDocx(element, 'complex-test.docx');

    expect(capturedBlob).toBeDefined();
    expect(capturedBlob.size).toBeGreaterThan(1000); // Complex doc should be larger
  });

  test('should generate consistent output for same input', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Consistent Document</h1>
      <p>This document should generate the same structure each time.</p>
    `;

    // Generate first document
    await exportHTMLDivToDocx(element, 'consistent1.docx');
    const firstBlobSize = capturedBlob.size;

    // Generate second document with same content
    await exportHTMLDivToDocx(element, 'consistent2.docx');
    const secondBlobSize = capturedBlob.size;

    // Sizes should be similar (may have slight variations due to timestamps)
    expect(Math.abs(firstBlobSize - secondBlobSize)).toBeLessThan(100);
  });

  describe('DOCX Content Validation', () => {
    test('should include all heading levels', async () => {
      const element = document.createElement('div');
      element.innerHTML = `
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      `;

      await exportHTMLDivToDocx(element, 'headings.docx');

      expect(capturedBlob).toBeDefined();
      expect(capturedBlob.size).toBeGreaterThan(0);
    });

    test('should handle special characters properly', async () => {
      const element = document.createElement('div');
      element.innerHTML = `
        <h1>Special Characters Test</h1>
        <p>Quotes: "double" and 'single'</p>
        <p>Symbols: & < > © ® ™</p>
        <p>Accents: café naïve résumé</p>
        <p>Unicode: 你好 مرحبا שלום</p>
        <p>Emojis: 😀 🎉 ✅</p>
      `;

      await exportHTMLDivToDocx(element, 'special-chars.docx');

      expect(capturedBlob).toBeDefined();
      expect(capturedBlob.size).toBeGreaterThan(0);
    });

    test('should handle empty elements gracefully', async () => {
      const element = document.createElement('div');
      element.innerHTML = `
        <h1></h1>
        <p></p>
        <div></div>
        <h2>After empty elements</h2>
      `;

      await exportHTMLDivToDocx(element, 'empty-elements.docx');

      expect(capturedBlob).toBeDefined();
      expect(capturedBlob.size).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large documents efficiently', async () => {
      const element = document.createElement('div');
      let html = '<h1>Large Document Test</h1>';
      
      // Generate a large document with 100 paragraphs
      for (let i = 0; i < 100; i++) {
        html += `<h2>Section ${i + 1}</h2>`;
        html += `<p>This is paragraph ${i + 1} with some sample text content.</p>`;
      }
      
      element.innerHTML = html;

      const startTime = Date.now();
      await exportHTMLDivToDocx(element, 'large-doc.docx');
      const endTime = Date.now();

      expect(capturedBlob).toBeDefined();
      expect(capturedBlob.size).toBeGreaterThan(5000);
      
      // Should complete in reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});