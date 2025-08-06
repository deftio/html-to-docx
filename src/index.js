import { Document, Packer, Paragraph, ImageRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import versionInfo from './version.js';

function svgToPng(svgElement) {
    return new Promise((resolve, reject) => {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/png');
        };

        img.onerror = () => reject(new Error('Failed to convert SVG to PNG'));

        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        img.src = svgDataUrl;
    });
}

async function processNode(node) {
    const children = [];

    for (let child of node.childNodes) {
        switch (child.nodeType) {
            case Node.TEXT_NODE:
                if (child.textContent.trim()) {
                    children.push(new Paragraph(child.textContent.trim()));
                }
                break;
            case Node.ELEMENT_NODE:
                switch (child.tagName.toLowerCase()) {
                    case 'h1':
                        children.push(new Paragraph({
                            text: child.textContent,
                            heading: HeadingLevel.HEADING_1
                        }));
                        break;
                    case 'h2':
                        children.push(new Paragraph({
                            text: child.textContent,
                            heading: HeadingLevel.HEADING_2
                        }));
                        break;
                    case 'h3':
                        children.push(new Paragraph({
                            text: child.textContent,
                            heading: HeadingLevel.HEADING_3
                        }));
                        break;
                    case 'h4':
                        children.push(new Paragraph({
                            text: child.textContent,
                            heading: HeadingLevel.HEADING_4
                        }));
                        break;
                    case 'h5':
                        children.push(new Paragraph({
                            text: child.textContent,
                            heading: HeadingLevel.HEADING_5
                        }));
                        break;
                    case 'h6':
                        children.push(new Paragraph({
                            text: child.textContent,
                            heading: HeadingLevel.HEADING_6
                        }));
                        break;
                    case 'p':
                        children.push(new Paragraph(child.textContent));
                        break;
                    case 'ul':
                    case 'ol':
                        const listItems = await processListNode(child);
                        children.push(...listItems);
                        break;
                    case 'div':
                    case 'section':
                    case 'article':
                        children.push(...await processNode(child));
                        break;
                    case 'img':
                        try {
                            const fullImageUrl = new URL(child.src, window.location.href).href;
                            const response = await fetch(fullImageUrl);
                            const arrayBuffer = await response.arrayBuffer();

                            if (arrayBuffer.byteLength > 0) {
                                const uint8Array = new Uint8Array(arrayBuffer);

                                const paragraph = new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: uint8Array,
                                            transformation: {
                                                width: Math.min(child.naturalWidth || 400, 600),
                                                height: Math.min(child.naturalHeight || 300, 450)
                                            },
                                            altText: child.alt || 'Image'
                                        })
                                    ]
                                });

                                children.push(paragraph);
                            } else {
                                console.error('Empty array buffer for image:', fullImageUrl);
                            }
                        } catch (error) {
                            console.error('Image processing failed:', error);
                        }
                        break;
                    case 'svg':
                        try {
                            const pngBlob = await svgToPng(child);
                            const arrayBuffer = await pngBlob.arrayBuffer();

                            if (arrayBuffer.byteLength > 0) {
                                const uint8Array = new Uint8Array(arrayBuffer);

                                const paragraph = new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: uint8Array,
                                            transformation: {
                                                width: child.width.baseVal.value || 200,
                                                height: child.height.baseVal.value || 200
                                            },
                                            altText: 'Converted SVG'
                                        })
                                    ]
                                });

                                children.push(paragraph);
                            } else {
                                console.error('Empty array buffer for converted SVG');
                            }
                        } catch (error) {
                            console.error('SVG processing failed:', error);
                        }
                        break;
                    case 'br':
                        children.push(new Paragraph(''));
                        break;
                    case 'hr':
                        children.push(new Paragraph({
                            text: '',
                            border: {
                                bottom: {
                                    color: 'auto',
                                    space: 1,
                                    style: 'single',
                                    size: 6
                                }
                            }
                        }));
                        break;
                    case 'blockquote':
                        const blockquoteChildren = await processNode(child);
                        blockquoteChildren.forEach(para => {
                            if (para instanceof Paragraph) {
                                children.push(new Paragraph({
                                    text: para.text || child.textContent,
                                    indent: { left: 720 }
                                }));
                            } else {
                                children.push(para);
                            }
                        });
                        break;
                    case 'table':
                        children.push(new Paragraph('[Table content - tables require special handling]'));
                        break;
                    default:
                        children.push(...await processNode(child));
                        break;
                }
                break;
        }
    }

    return children;
}

async function processListNode(listNode) {
    const listItems = [];
    const isOrdered = listNode.tagName.toLowerCase() === 'ol';
    let itemIndex = 1;

    for (let child of listNode.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'li') {
            const bullet = isOrdered ? `${itemIndex}. ` : '• ';
            listItems.push(new Paragraph({
                text: bullet + child.textContent,
                indent: { left: 360 }
            }));
            itemIndex++;
        }
    }

    return listItems;
}

async function exportHTMLDivToDocx(element, filename = "document.docx", metadata = {}, callback) {
    let isExporting = false;

    if (isExporting) {
        console.log('Export already in progress');
        return;
    }

    isExporting = true;

    try {
        const children = await processNode(element);

        const doc = new Document({
            creator: metadata.creator || "HTML to DOCX",
            title: metadata.title || "Document",
            description: metadata.description || "Document exported from HTML",
            sections: [{
                properties: {},
                children: children
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename);
        console.log(`html-docx-mini v${versionInfo.version}: Export completed successfully`);
    } catch (error) {
        console.error('Error during DOCX creation:', error);
    } finally {
        isExporting = false;
        if (callback) callback();
    }
}

const HtmlDocxMini = {
    exportHTMLDivToDocx,
    svgToPng,
    processNode,
    processListNode,
    version: versionInfo.version,
    VERSION: versionInfo.version,
    versionInfo: versionInfo
};

export default HtmlDocxMini;
export { exportHTMLDivToDocx, svgToPng, processNode, processListNode, versionInfo };