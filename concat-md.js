#!/usr/bin/env node
/**
 * Concatenate all Markdown files from a folder (recursively) into one file.
 * Usage:
 *   node concat-md.js <inputDir> <outputFile>
 * Example:
 *   node concat-md.js ./docs ./all-docs.md
 */

const fs = require("fs").promises;
const path = require("path");

const exts = new Set([".md", ".markdown", ".mdx"]);
const ignoreDirs = new Set(["node_modules", ".git", ".github", ".next", "dist", "build", ".cache"]);

async function getMarkdownFiles(dir, baseDir = dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        // skip hidden directories commonly used for tooling
        if (entry.isDirectory()) {
            if (ignoreDirs.has(entry.name)) continue;
            await getMarkdownFiles(path.join(dir, entry.name), baseDir, files);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (exts.has(ext)) {
                const absPath = path.join(dir, entry.name);
                const relPath = path.relative(baseDir, absPath).split(path.sep).join("/");
                files.push({ absPath, relPath });
            }
        }
    }
    return files;
}

function normalizeContent(s) {
    // Remove BOM if present and normalize newlines
    if (!s) return "";
    return s.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
}

async function main() {
    const [inputDir, outputFile] = process.argv.slice(2);

    if (!inputDir || !outputFile) {
        console.error("Usage: node concat-md.js <inputDir> <outputFile>");
        process.exit(1);
    }

    const inDir = path.resolve(process.cwd(), inputDir);
    const outFile = path.resolve(process.cwd(), outputFile);

    // Ensure input directory exists
    try {
        const stat = await fs.stat(inDir);
        if (!stat.isDirectory()) {
            console.error(`Error: ${inputDir} is not a directory`);
            process.exit(1);
        }
    } catch (e) {
        console.error(`Error: cannot access input directory "${inputDir}"`);
        console.error(e.message);
        process.exit(1);
    }

    const files = await getMarkdownFiles(inDir);

    // Sort by relative path for deterministic output
    files.sort((a, b) => a.relPath.localeCompare(b.relPath, undefined, { sensitivity: "base" }));

    if (files.length === 0) {
        console.warn("No Markdown files found. Creating an empty output file.");
        await fs.writeFile(outFile, "", "utf8");
        return;
    }

    const parts = [];
    // parts.push(`<!-- Concatenated on ${new Date().toISOString()} from ${files.length} files -->\n`);
    parts.push('\n')

    for (const { absPath, relPath } of files) {
        const raw = await fs.readFile(absPath, "utf8");
        const content = normalizeContent(raw);

        // Separator with file path as a visible marker
        // parts.push(`\n\n---\n\n<!-- FILE: ${relPath} -->\n\n`);
        parts.push('\n')

        // If the file doesn't start with a top-level heading, add a small heading using its path (optional)
        const startsWithHeading = /^#\s/.test(content.trimStart());
        if (!startsWithHeading) {
            parts.push(`# ${relPath}\n\n`);
        }

        parts.push(content.trimEnd() + "\n");
    }

    // Ensure parent folder exists
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, parts.join(""), "utf8");

    console.log(`Done. Wrote ${files.length} files into:\n${outFile}`);
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
