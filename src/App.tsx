import { useState, useRef } from "react";
import { mdToHTML, mdToHTMLGrouped } from "./converter";
// @ts-ignore
import "./index.css";

interface ConvertedFile {
    name: string;
    originalName: string;
    html: string;
    timestamp: number;
    markdown: string;
}

export function App() {
    const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.name.endsWith('.md') || file.name.endsWith('.markdown')
        );

        await processFiles(files);
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(
                file => file.name.endsWith('.md') || file.name.endsWith('.markdown')
            );
            await processFiles(files);
        }
    };

    const processFiles = async (files: File[]) => {
        // Extra validation to ensure only .md files are processed
        const markdownFiles = files.filter(
            file => file.name.endsWith('.md') || file.name.endsWith('.markdown')
        );

        if (markdownFiles.length === 0) {
            alert('Please upload only Markdown files (.md or .markdown)');
            return;
        }

        for (const file of markdownFiles) {
            const text = await file.text();
            const html = await mdToHTML(text);

            const newFile: ConvertedFile = {
                name: file.name.replace(/\.(md|markdown)$/, '.html'),
                originalName: file.name,
                html: html,
                markdown: text,
                timestamp: Date.now()
            };

            setConvertedFiles(prev => [...prev, newFile]);
        }
    };

    const handleDownload = (file: ConvertedFile) => {
        const blob = new Blob([file.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        setConvertedFiles([]);
    };
    const handleDownloadGrouped = async () => {
        const filesData = convertedFiles.map(file => ({
            title: file.originalName.replace(/\.(md|markdown)$/, ''),
            markdown: file.markdown
        }));

        const groupedHtml = await mdToHTMLGrouped(filesData);
        const blob = new Blob([groupedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'combined.html';
        a.click();
        URL.revokeObjectURL(url);
    };


    return (
        <div className="md-converter-app">
            <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="color-accent">Markdown to HTML Converter</h1>
                <p style={{ color: 'var(--small-text-color)' }}>
                    Drop your markdown files here or click to browse
                </p>
            </header>

            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>
                    upload_file
                </span>
                <p>Drag & drop markdown files here</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--small-text-color)' }}>
                    or click to browse
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.markdown"
                    multiple
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
            </div>

            {convertedFiles.length > 0 && (
                <div className="converted-files-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                        <h2 className="color-accent">Converted Files ({convertedFiles.length})</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {convertedFiles.length > 1 && (
                                <button className="grouped-button" onClick={handleDownloadGrouped}>
                                    <span className="material-symbols-outlined">folder_zip</span>
                                    Download Grouped
                                </button>
                            )}
                            <button className="clear-button" onClick={handleClearAll}>
                                Clear All
                            </button>
                        </div>
                    </div>

                    <table className="files-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Original File</th>
                                <th>Output File</th>
                                <th>Converted At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {convertedFiles.map((file, index) => (
                                <tr key={file.timestamp + index}>
                                    <td>{index + 1}</td>
                                    <td>{file.originalName}</td>
                                    <td>{file.name}</td>
                                    <td>{new Date(file.timestamp).toLocaleTimeString()}</td>
                                    <td>
                                        <button
                                            className="download-button"
                                            onClick={() => handleDownload(file)}
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;
