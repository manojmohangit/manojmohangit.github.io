const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Ensure directories exist
const postsDir = path.join(__dirname, '../posts');
const outputDir = path.join(__dirname, '../blog');
const assetsDataDir = path.join(__dirname, '../assets/data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(assetsDataDir)) {
    fs.mkdirSync(assetsDataDir, { recursive: true });
}

// Load template
const templatePath = path.join(postsDir, 'template.html');
if (!fs.existsSync(templatePath)) {
    console.error('Error: posts/template.html not found!');
    process.exit(1);
}
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Configure marked to allow raw HTML tags
marked.setOptions({
    mangle: false,
    headerIds: false,
    breaks: true
});

const localPostsMetadata = [];

// Read posts
const files = fs.readdirSync(postsDir);
files.forEach(file => {
    if (!file.endsWith('.md')) return;

    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter and content
    const { data, content } = matter(fileContent);
    const htmlContent = marked.parse(content);
    
    const slug = path.basename(file, '.md');
    const title = data.title || 'Untitled Post';
    const dateStr = data.date || new Date().toISOString().split('T')[0];
    const description = data.description || '';

    // Replace placeholders in template
    let renderedHtml = templateContent
        .replace(/{{title}}/g, title)
        .replace(/{{date}}/g, new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase())
        .replace(/{{description}}/g, description)
        .replace(/{{content}}/g, htmlContent);

    // Save rendered post HTML file
    const outputFilePath = path.join(outputDir, `${slug}.html`);
    fs.writeFileSync(outputFilePath, renderedHtml, 'utf8');
    console.log(`Compiled: ${file} -> blog/${slug}.html`);

    // Add metadata for listings
    localPostsMetadata.push({
        title,
        date: dateStr,
        dateStr: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
        excerpt: description,
        link: `./blog/${slug}.html`,
        source: 'DEV BLOG',
        tags: data.tags || []
    });
});

// Sort posts by date descending
localPostsMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));

// Write metadata file
fs.writeFileSync(
    path.join(assetsDataDir, 'local-posts.json'),
    JSON.stringify(localPostsMetadata, null, 2),
    'utf8'
);
console.log(`Generated registry of ${localPostsMetadata.length} local posts in assets/data/local-posts.json`);
