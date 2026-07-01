/**
 * Docsify Static Prerender Build Script
 *
 * Problem: Docsify with routerMode: 'history' creates pretty URLs like
 * /producers/why-list-here, but on static hosting (GitHub Pages) there are
 * no actual HTML files at those paths. Googlebot receives HTTP 404 and
 * cannot index the pages.
 *
 * Solution: Generate a static index.html for every markdown file that:
 *  1. Returns HTTP 200 (file exists at the path)
 *  2. Contains proper SEO meta tags (<title>, description, canonical, OG)
 *  3. Contains prerendered static HTML content for crawlers
 *  4. Still loads Docsify so human users get the SPA experience
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://docs.redcarpethq.org';
const DOCS_DIR = __dirname;

// Simple markdown-to-HTML converter for prerendering
function mdToHtml(md) {
    let html = md
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold / italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Code blocks (simple inline only)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Blockquotes
        .replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
        // Lists
        .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
        // Paragraphs (blank line separated)
        .split('\n\n')
        .map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<h') ||
                trimmed.startsWith('<li') ||
                trimmed.startsWith('<blockquote') ||
                trimmed.startsWith('<hr') ||
                trimmed.startsWith('<table') ||
                trimmed.startsWith('<pre')) {
                return trimmed;
            }
            return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
        })
        .join('\n\n');

    return html;
}

function extractTitle(md) {
    const match = md.match(/^# (.+)$/m);
    return match ? match[1].trim() : 'RedCarpetHQ Documentation';
}

function extractDescription(md) {
    // Skip title and find first substantial paragraph
    const lines = md.split('\n');
    let foundTitle = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
            foundTitle = true;
            continue;
        }
        if (!foundTitle) continue;
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('![') && !trimmed.startsWith('>')) {
            // Strip markdown formatting for plain text description
            return trimmed
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
                .replace(/`([^`]+)`/g, '$1')
                .substring(0, 160);
        }
    }
    return 'RedCarpetHQ Documentation — The AI-Powered Exchange for Tokenized Entertainment Profits';
}

function getAllMdFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllMdFiles(fullPath, files);
        } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
            files.push(fullPath);
        }
    }
    return files;
}

function build() {
    console.log('Building static prerendered docs...\n');

    const mdFiles = getAllMdFiles(DOCS_DIR);
    const templatePath = path.join(DOCS_DIR, 'index.html');
    const rawTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Clean up template: remove empty OG/twitter tags that will be replaced
    const template = rawTemplate
        .replace(/\s*<meta property="og:title" content="">\n/, '')
        .replace(/\s*<meta property="og:url" content="">\n/, '')
        .replace(/\s*<meta property="og:description" content="">\n/, '')
        .replace(/\s*<meta property="twitter:title" content="">\n/, '')
        .replace(/\s*<meta property="twitter:description" content="">\n/, '');

    const sitemapUrls = [];
    const routes = [];

    for (const mdPath of mdFiles) {
        const relativePath = path.relative(DOCS_DIR, mdPath);
        const routePath = relativePath.replace(/\.md$/, '');

        // Skip 404.md (Docsify internal not-found page) and root README.md (homepage)
        if (routePath === '404' || routePath === 'README') {
            continue;
        }

        const outputDir = path.join(DOCS_DIR, routePath);
        const outputPath = path.join(outputDir, 'index.html');

        const mdContent = fs.readFileSync(mdPath, 'utf-8');
        const title = extractTitle(mdContent);
        const description = extractDescription(mdContent);
        const staticHtml = mdToHtml(mdContent);

        const canonicalUrl = `${BASE_URL}/${routePath}`;
        const pageTitle = `${title} | RedCarpetHQ Documentation`;

        // Modify the template for this specific page
        let pageHtml = template;

        // Inject <base> tag so relative URLs (including Docsify's markdown fetch)
        // resolve from the domain root, not the subdirectory
        if (!pageHtml.includes('<base href=')) {
            pageHtml = pageHtml.replace(
                /<head>/,
                `<head>\n    <base href="${BASE_URL}/">`
            );
        }

        // Inject SEO meta tags and static content
        const seoHead = `
    <title>${pageTitle}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="article">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${description}">
`;

        // Replace the empty <title></title> and inject after it
        pageHtml = pageHtml.replace(/<title><\/title>/, seoHead.trim());

        // Replace the <div id="app"></div> with prerendered static content
        // Docsify will overwrite this when JS loads, but crawlers see the static HTML
        const prerenderedBody = `
    <div id="app">
      <article class="markdown-section" id="main">
        ${staticHtml}
      </article>
    </div>`;

        pageHtml = pageHtml.replace(
            /<div id="app"><\/div>/,
            prerenderedBody
        );

        // Inject basePath so Docsify resolves markdown from root, not the subdirectory
        if (!pageHtml.includes('basePath:')) {
            pageHtml = pageHtml.replace(
                /window\.\$docsify = \{/,
                "window.$docsify = {\n            basePath: '/',"
            );
        }

        // Ensure output directory exists
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputPath, pageHtml);

        sitemapUrls.push({
            loc: canonicalUrl,
            lastmod: new Date().toISOString().split('T')[0],
        });
        routes.push(routePath);

        console.log(`Generated: ${outputPath.replace(DOCS_DIR + '/', '')}`);
    }

    // Generate sitemap.xml (include root homepage)
    const allUrls = [
        { loc: BASE_URL, lastmod: new Date().toISOString().split('T')[0] },
        ...sitemapUrls
    ];
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(DOCS_DIR, 'sitemap.xml'), sitemapXml);
    console.log('\nGenerated: sitemap.xml');

    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(path.join(DOCS_DIR, 'robots.txt'), robotsTxt);
    console.log('Generated: robots.txt');

    console.log(`\nDone! Generated ${routes.length} static pages.`);
    console.log('\nNext steps:');
    console.log('  1. Commit these generated files to git');
    console.log('  2. Push to trigger deployment');
    console.log('  3. In Google Search Console, request validation for the affected URLs');
    console.log('  4. Submit the updated sitemap.xml for re-crawling');
}

build();
