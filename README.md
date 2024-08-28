# HTML to DOCX Exporter

This project is a simple web-based tool for exporting HTML content, including images and SVGs, to a DOCX file. It leverages the `docx` JavaScript library and allows you to generate a Word document from structured HTML content, with support for various elements like headings, paragraphs, images, and SVG graphics.

## Features

- **Export HTML to DOCX**: Convert an HTML structure into a DOCX file with proper formatting.
- **Support for Images**: Includes image support with automatic conversion and embedding.
- **Support for SVG Graphics**: SVG elements are converted to PNG and embedded into the DOCX.
- **Progress Indication**: The export process is asynchronous, and the UI indicates when the export is in progress.

## How It Works

1. **HTML Structure**: The HTML content is structured with various elements like headings (`<h1>` to `<h5>`), paragraphs (`<p>`), images (`<img>`), and SVGs (`<svg>`).
2. **Export Button**: The user initiates the export process by clicking the "Export to DOCX" button.
3. **Asynchronous Export**: The export process runs asynchronously, converting the HTML content into a DOCX file.
4. **Progress Indication**: During the export, the button text changes to "Export in Progress..." and is disabled to prevent multiple clicks.
5. **Download DOCX**: Once the export is complete, the DOCX file is automatically downloaded.

## Getting Started

### Prerequisites

To run this project, you need:

- A modern web browser with JavaScript enabled.

### Usage

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/html-to-docx-exporter.git
   cd html-to-docx-exporter
   ```

2. **Open `index.html` in a Browser**

   Simply open the `index.html` file in your web browser to use the tool.

3. **Edit Content**

   Modify the HTML within the `#content` div to customize what gets exported.

4. **Click "Export to DOCX"**

   Click the "Export to DOCX" button to generate and download the DOCX file.

### Example

Here is an example of the HTML structure that will be converted:

```html
<div id="content">
    <h2>Main Title</h2>
    <p>Generated on: 2024-08-27 12:34:56</p>
    <p>Introduction content under the main title.</p>
    <svg width="200" height="200">
        <!-- SVG Content -->
    </svg>
    <img src="./sample.jpeg" alt="Sample Image">
    <h3>Section 1</h3>
    <p>Content in Section 1.</p>
</div>
```

### Code Overview

- **`index.html`**: The main HTML file that includes the content to be exported and the export logic.
- **`exportHTMLDivToDocx` Function**: Encapsulates the logic for converting the HTML content into a DOCX file, including handling images and SVGs.
- **Progress Handling**: The button's state is managed to indicate progress and prevent multiple exports simultaneously.

### Customization

You can customize the HTML content within the `#content` div to include your desired structure, images, and SVGs. The export function is designed to be flexible and handle various HTML elements.

### Known Issues

- Large or complex SVGs may take longer to process.
- The export process may take a few seconds, depending on the content size and complexity.

### Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

