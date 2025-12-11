import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import { htmlTemplate, cssTemplate } from "./templates";

marked.use(markedKatex({
    output: "mathml"
}));

export const mdToHTML = async (markdown: string, title?: string) => {
    const extractedTitle = (title || markdown.split('\n')[0]?.replace(/^#+(\s+)?/g, '')) ?? '';
    const content = await marked(markdown.split('\n').slice(1).join('\n'));

    return htmlTemplate
        .replace(/{{D3-WEBPAGETITLE}}/g, 'Made by D3FAU4T (14542723127)')
        .replace(/{{D3-TITLE}}/g, extractedTitle)
        .replace('/*{{D3-CSS}}*/', cssTemplate)
        .replace(/{{D3-MARKDOWN}}/g, content);
}

export const mdToHTMLGrouped = async (files: Array<{ title: string; markdown: string }>) => {
    const sections = await Promise.all(
        files.map(async (file) => {
            const content = await marked(file.markdown.split('\n').slice(1).join('\n'));
            return `<section class="scrollbar-wrapper" id="content-${file.title}">${content}</section>`;
        })
    );

    const groupedContent = sections.join('\n');
    const firstFileTitle = files[0]?.markdown.split('\n')[0]?.replace(/^#+(\s+)?/g, '') ?? 'Combined';

    return htmlTemplate
        .replace(/{{D3-WEBPAGETITLE}}/g, `combined.html`)
        .replace(/{{D3-TITLE}}/g, firstFileTitle)
        .replace('/*{{D3-CSS}}*/', cssTemplate)
        .replace(/{{D3-MARKDOWN}}/g, groupedContent);
}