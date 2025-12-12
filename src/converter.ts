import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import htmlTemplate from "./template/canvas.html" with { type: "text" };
// @ts-ignore
import cssTemplate from "./template/style.css" with { type: "text" };

marked.use(markedKatex({
    output: "mathml"
}));

export const mdToHTML = async (markdown: string, title?: string) => {
    const extractedTitle = (title || markdown.split('\n')[0]?.replace(/^#+(\s+)?/g, '')) ?? '';
    const content = await marked(markdown.split('\n').slice(1).join('\n'));
    const wrappedContent = `<section class="scrollbar-wrapper" id="content-main">${content}</section>`;

    return htmlTemplate
        // @ts-ignore
        .replace(/{{D3-WEBPAGETITLE}}/g, 'Made by D3FAU4T (14542723127)')
        .replace(/{{D3-TITLE}}/g, extractedTitle)
        .replace('/*{{D3-CSS}}*/', cssTemplate)
        .replace(/{{D3-MARKDOWN}}/g, wrappedContent);
}

export const mdToHTMLGrouped = async (files: Array<{ title: string; markdown: string }>) => {
    const sections = await Promise.all(
        files.map(async (file) => {
            // Extract h1 for use in header, but remove it from content to avoid duplication
            const h1Title = file.markdown.split('\n')[0]?.replace(/^#+(\s+)?/g, '') ?? '';
            const content = await marked(file.markdown.split('\n').slice(1).join('\n'));
            // Sanitize the title to create a valid CSS ID
            const sanitizedTitle = file.title.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');
            // Store h1 as data attribute so showSection can access it
            return `<section class="scrollbar-wrapper" id="content-${sanitizedTitle}" data-h1-title="${h1Title}">${content}</section>`;
        })
    );

    const groupedContent = sections.join('\n');
    const firstFileTitle = files[0]?.markdown.split('\n')[0]?.replace(/^#+(\s+)?/g, '') ?? 'Combined';

    return htmlTemplate
        // @ts-ignore
        .replace(/{{D3-WEBPAGETITLE}}/g, `combined.html`)
        .replace(/{{D3-TITLE}}/g, firstFileTitle)
        .replace('/*{{D3-CSS}}*/', cssTemplate)
        .replace(/{{D3-MARKDOWN}}/g, groupedContent);
}