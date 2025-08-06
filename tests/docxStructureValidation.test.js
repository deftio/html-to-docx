import { exportHTMLDivToDocx } from '../src/index.js';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

jest.mock('file-saver');

describe('DOCX Structure Validation', () => {
  let capturedBlob;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedBlob = null;
    
    saveAs.mockImplementation((blob) => {
      capturedBlob = blob;
    });
  });

  async function validateDocxStructure(blob) {
    const zip = new JSZip();
    const docx = await zip.loadAsync(blob);
    
    // Check for required DOCX structure files
    const requiredFiles = [
      '[Content_Types].xml',
      '_rels/.rels',
      'word/document.xml',
      'word/_rels/document.xml.rels',
      'word/styles.xml'
    ];
    
    const validation = {
      hasRequiredFiles: true,
      missingFiles: [],
      documentXmlValid: false,
      contentTypesValid: false,
      relsValid: false,
      hasValidStructure: false
    };
    
    // Check for required files
    for (const file of requiredFiles) {
      if (!docx.file(file)) {
        validation.hasRequiredFiles = false;
        validation.missingFiles.push(file);
      }
    }
    
    // Validate document.xml structure
    if (docx.file('word/document.xml')) {
      const documentXml = await docx.file('word/document.xml').async('string');
      validation.documentXmlValid = 
        documentXml.includes('<w:document') && 
        documentXml.includes('<w:body>') &&
        documentXml.includes('</w:body>') &&
        documentXml.includes('</w:document>');
    }
    
    // Validate Content Types
    if (docx.file('[Content_Types].xml')) {
      const contentTypes = await docx.file('[Content_Types].xml').async('string');
      validation.contentTypesValid = 
        contentTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml') &&
        contentTypes.includes('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">');
    }
    
    // Validate relationships
    if (docx.file('_rels/.rels')) {
      const rels = await docx.file('_rels/.rels').async('string');
      validation.relsValid = 
        rels.includes('http://schemas.openxmlformats.org/officeDocument/2006/relationships') &&
        rels.includes('Target="word/document.xml"');
    }
    
    validation.hasValidStructure = 
      validation.hasRequiredFiles && 
      validation.documentXmlValid && 
      validation.contentTypesValid && 
      validation.relsValid;
    
    return validation;
  }

  test('should generate valid DOCX structure with required files', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Test Document</h1>
      <p>This is a test paragraph.</p>
    `;

    await exportHTMLDivToDocx(element, 'test.docx');
    
    const validation = await validateDocxStructure(capturedBlob);
    
    expect(validation.hasRequiredFiles).toBe(true);
    expect(validation.missingFiles).toHaveLength(0);
    expect(validation.documentXmlValid).toBe(true);
    expect(validation.contentTypesValid).toBe(true);
    expect(validation.relsValid).toBe(true);
    expect(validation.hasValidStructure).toBe(true);
  });

  test('should generate valid document.xml with proper namespace', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Simple content</p>';

    await exportHTMLDivToDocx(element, 'namespace-test.docx');
    
    const zip = new JSZip();
    const docx = await zip.loadAsync(capturedBlob);
    const documentXml = await docx.file('word/document.xml').async('string');
    
    // Check for proper Word namespaces
    expect(documentXml).toContain('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"');
    expect(documentXml).toContain('<w:document');
    expect(documentXml).toContain('<w:body>');
    expect(documentXml).toContain('<w:p>'); // Should have paragraph
    expect(documentXml).toContain('</w:document>');
  });

  test('should include paragraph content in document.xml', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Title Text</h1>
      <p>Paragraph content here</p>
    `;

    await exportHTMLDivToDocx(element, 'content-test.docx');
    
    const zip = new JSZip();
    const docx = await zip.loadAsync(capturedBlob);
    const documentXml = await docx.file('word/document.xml').async('string');
    
    // Check that content is included (text runs)
    expect(documentXml).toContain('<w:t');
    expect(documentXml).toContain('Title Text');
    expect(documentXml).toContain('Paragraph content here');
  });

  test('should handle multiple heading levels correctly', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
    `;

    await exportHTMLDivToDocx(element, 'headings-test.docx');
    
    const zip = new JSZip();
    const docx = await zip.loadAsync(capturedBlob);
    const documentXml = await docx.file('word/document.xml').async('string');
    
    // Should have multiple paragraphs with style references
    expect(documentXml).toContain('<w:p>');
    expect(documentXml).toContain('<w:pStyle');
    expect(documentXml).toContain('Heading 1');
    expect(documentXml).toContain('Heading 2');
    expect(documentXml).toContain('Heading 3');
  });

  test('should create valid relationships file', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test</p>';

    await exportHTMLDivToDocx(element, 'rels-test.docx');
    
    const zip = new JSZip();
    const docx = await zip.loadAsync(capturedBlob);
    const rels = await docx.file('word/_rels/document.xml.rels').async('string');
    
    // Check for valid relationships structure
    expect(rels).toContain('<?xml version="1.0"');
    expect(rels).toContain('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">');
    expect(rels).toContain('</Relationships>');
  });

  test('should include styles.xml with proper structure', async () => {
    const element = document.createElement('div');
    element.innerHTML = '<h1>Styled Document</h1>';

    await exportHTMLDivToDocx(element, 'styles-test.docx');
    
    const zip = new JSZip();
    const docx = await zip.loadAsync(capturedBlob);
    const styles = await docx.file('word/styles.xml').async('string');
    
    // Check for valid styles structure
    expect(styles).toContain('<?xml version="1.0"');
    expect(styles).toContain('<w:styles');
    expect(styles).toContain('</w:styles>');
  });

  test('should generate DOCX that follows OOXML standards', async () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>OOXML Compliant Document</h1>
      <p>This document should follow OOXML standards.</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
    `;

    await exportHTMLDivToDocx(element, 'ooxml-test.docx');
    
    const zip = new JSZip();
    const docx = await zip.loadAsync(capturedBlob);
    
    // Check all critical OOXML components
    const contentTypes = await docx.file('[Content_Types].xml').async('string');
    expect(contentTypes).toContain('application/vnd.openxmlformats-package.relationships+xml');
    expect(contentTypes).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml');
    
    const coreRels = await docx.file('_rels/.rels').async('string');
    expect(coreRels).toContain('http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument');
    
    // Verify ZIP structure
    const files = Object.keys(docx.files);
    expect(files).toContain('[Content_Types].xml');
    expect(files).toContain('_rels/.rels');
    expect(files.some(f => f.startsWith('word/'))).toBe(true);
  });

  describe('Error Detection', () => {
    test('should not have malformed XML', async () => {
      const element = document.createElement('div');
      element.innerHTML = `
        <p>Text with special chars: & < > " '</p>
      `;

      await exportHTMLDivToDocx(element, 'special-chars-test.docx');
      
      const zip = new JSZip();
      const docx = await zip.loadAsync(capturedBlob);
      const documentXml = await docx.file('word/document.xml').async('string');
      
      // Check that special characters are properly escaped
      expect(documentXml).not.toContain('& <'); // Should be escaped as &amp;
      expect(documentXml).toContain('&amp;'); // Properly escaped ampersand
      
      // Verify XML is well-formed (basic check)
      const openTags = (documentXml.match(/<w:\w+[^>]*>/g) || []).length;
      const closeTags = (documentXml.match(/<\/w:\w+>/g) || []).length;
      const selfClosing = (documentXml.match(/<w:\w+[^>]*\/>/g) || []).length;
      
      // Open tags should roughly match close tags (accounting for self-closing)
      expect(Math.abs(openTags - closeTags - selfClosing)).toBeLessThan(5);
    });

    test('should handle empty content gracefully', async () => {
      const element = document.createElement('div');
      element.innerHTML = '';

      await exportHTMLDivToDocx(element, 'empty-test.docx');
      
      const validation = await validateDocxStructure(capturedBlob);
      expect(validation.hasValidStructure).toBe(true);
      
      const zip = new JSZip();
      const docx = await zip.loadAsync(capturedBlob);
      const documentXml = await docx.file('word/document.xml').async('string');
      
      // Should still have valid document structure even if empty
      expect(documentXml).toContain('<w:body>');
      expect(documentXml).toContain('</w:body>');
    });
  });

  describe('Complex Document Validation', () => {
    test('should handle deeply nested structures', async () => {
      const element = document.createElement('div');
      element.innerHTML = `
        <div>
          <div>
            <div>
              <h1>Deeply Nested Title</h1>
              <div>
                <p>Nested paragraph</p>
              </div>
            </div>
          </div>
        </div>
      `;

      await exportHTMLDivToDocx(element, 'nested-test.docx');
      
      const validation = await validateDocxStructure(capturedBlob);
      expect(validation.hasValidStructure).toBe(true);
      
      const zip = new JSZip();
      const docx = await zip.loadAsync(capturedBlob);
      const documentXml = await docx.file('word/document.xml').async('string');
      
      expect(documentXml).toContain('Deeply Nested Title');
      expect(documentXml).toContain('Nested paragraph');
    });

    test('should maintain document integrity with mixed content', async () => {
      const element = document.createElement('div');
      element.innerHTML = `
        <h1>Mixed Content Document</h1>
        <p>Regular paragraph</p>
        <ul>
          <li>List item</li>
        </ul>
        <blockquote>A quote</blockquote>
        <hr>
        <h2>Section 2</h2>
        <ol>
          <li>Ordered item</li>
        </ol>
      `;

      await exportHTMLDivToDocx(element, 'mixed-test.docx');
      
      const validation = await validateDocxStructure(capturedBlob);
      expect(validation.hasValidStructure).toBe(true);
      
      const zip = new JSZip();
      const docx = await zip.loadAsync(capturedBlob);
      
      // Verify all required files exist and have content
      const documentXml = await docx.file('word/document.xml').async('string');
      expect(documentXml.length).toBeGreaterThan(1000); // Should have substantial content
      
      // Check that all text content is preserved
      expect(documentXml).toContain('Mixed Content Document');
      expect(documentXml).toContain('Regular paragraph');
      expect(documentXml).toContain('List item');
      expect(documentXml).toContain('A quote');
      expect(documentXml).toContain('Section 2');
      expect(documentXml).toContain('Ordered item');
    });
  });
});