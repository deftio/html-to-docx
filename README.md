# HTML Docx Mini

A lightweight JavaScript library for converting HTML to DOCX files. Works in both **browsers** and **Node.js** environments. All dependencies bundled in a single 342KB minified file - no external dependencies needed!

[Live Demo Here](https://deftio.github.io/html-to-docx/example.html)

## Why HTML Docx Mini?

- ✅ **Universal**: Works in browsers AND Node.js
- ✅ **Lightweight**: Only 342KB minified with all dependencies included
- ✅ **Zero Config**: Works out of the box, no setup required  
- ✅ **No External Dependencies**: Everything bundled in one file
- ✅ **Simple API**: One function does it all
- ✅ **Well Tested**: Comprehensive test suite ensures reliability

## Features

- **Standalone Library**: All dependencies (docx.js and FileSaver.js) are bundled
- **HTML Element Support**: Headings (h1-h6), paragraphs, lists, divs, blockquotes, and more
- **Image Support**: Automatic image embedding with smart sizing
- **SVG Support**: Converts SVG elements to PNG and embeds them
- **Easy Integration**: Simple API with UMD, ES Module, and minified builds
- **Async Processing**: Non-blocking export with progress callbacks

## Installation

### Using npm

```bash
npm install html-docx-mini
```

### Using CDN

```html
<script src="https://unpkg.com/html-docx-mini/dist/html-docx-mini.min.js"></script>
```

### Direct Download

Download the library from the `dist` folder:

- `html-docx-mini.js` - Full UMD build
- `html-docx-mini.min.js` - Minified UMD build (recommended for production)
- `html-docx-mini.esm.js` - ES Module build

## Usage

### Browser (Script Tag)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="path/to/html-docx-mini.min.js"></script>
</head>
<body>
    <div id="content">
        <h1>My Document</h1>
        <p>This is my content that will be exported to DOCX.</p>
    </div>
    
    <button onclick="exportDocument()">Export to DOCX</button>
    
    <script>
        function exportDocument() {
            const element = document.getElementById('content');
            
            HtmlDocxMini.exportHTMLDivToDocx(
                element,
                'my-document.docx',
                {
                    creator: 'Your Name',
                    title: 'My Document',
                    description: 'A document created from HTML'
                }
            );
        }
    </script>
</body>
</html>
```

### ES Module

```javascript
import { exportHTMLDivToDocx } from 'html-docx-mini';

const element = document.getElementById('content');

exportHTMLDivToDocx(
    element,
    'document.docx',
    {
        creator: 'Your App',
        title: 'Document Title',
        description: 'Document description'
    },
    () => {
        console.log('Export completed!');
    }
);
```

### CommonJS / Node.js

```javascript
const HtmlDocxMini = require('html-docx-mini');

// Note: This library is designed for browser use
// Node.js usage requires a DOM implementation
```

## API Reference

### exportHTMLDivToDocx(element, filename, metadata, callback)

Main function to export HTML content to DOCX.

#### Parameters

- `element` (HTMLElement): The HTML element to export
- `filename` (string): Output filename (default: "document.docx")
- `metadata` (object): Document metadata
  - `creator` (string): Document creator name
  - `title` (string): Document title
  - `description` (string): Document description
- `callback` (function): Optional callback function called when export completes

#### Example

```javascript
HtmlDocxMini.exportHTMLDivToDocx(
    document.getElementById('content'),
    'report.docx',
    {
        creator: 'John Doe',
        title: 'Annual Report 2024',
        description: 'Company annual report'
    },
    function() {
        console.log('Export completed');
    }
);
```

## Supported HTML Elements

| Element | DOCX Conversion |
|---------|----------------|
| `<h1>` to `<h6>` | Heading levels 1-6 |
| `<p>` | Paragraph |
| `<ul>`, `<ol>` | Bulleted and numbered lists |
| `<li>` | List items |
| `<img>` | Embedded images |
| `<svg>` | Converted to PNG and embedded |
| `<div>`, `<section>` | Container (processes children) |
| `<blockquote>` | Indented paragraph |
| `<br>` | Line break |
| `<hr>` | Horizontal line |

## Building from Source

```bash
# Clone the repository
git clone https://github.com/deftio/html-to-docx.git
cd html-to-docx

# Install dependencies
npm install

# Build the library
npm run build

# Watch for changes (development)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```text
html-to-docx/
├── src/
│   └── index.js              # Source code
├── dist/
│   ├── html-docx-mini.js      # UMD build
│   ├── html-docx-mini.min.js  # Minified UMD build
│   └── html-docx-mini.esm.js  # ES Module build
├── example.html         # Usage example
├── package.json
├── rollup.config.js     # Build configuration
└── README.md
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Comparison with Alternatives

Unlike other HTML to DOCX converters, this library focuses on:

- **Simplicity over features** - Does one thing well
- **Client-side only** - No server or Node.js required
- **Minimal size** - 342KB includes everything
- **Zero configuration** - No webpack, babel, or build setup needed

## Testing & Validation

The library includes comprehensive tests to ensure generated DOCX files are valid:

- **Structure Validation**: Verifies DOCX files contain all required OOXML components
- **XML Validation**: Ensures proper XML structure and namespace declarations
- **Content Integrity**: Confirms all HTML content is properly converted and preserved
- **Standards Compliance**: Validates against Office Open XML (OOXML) standards

Run tests with: `npm test`

## Known Limitations

- Tables require special handling (currently shown as placeholder text)
- Complex CSS styling is not preserved
- Large images may need manual sizing adjustments
- SVG conversion requires Canvas API support

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

This library bundles the following dependencies:

- [docx](https://github.com/dolanmiu/docx) - Generate DOCX files
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - Save files on the client-side
