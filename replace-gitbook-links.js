const fs = require('fs');
const path = require('path');

/**
 * Recursively fetches all HTML files in a directory.
 * @param {string} dir - The directory path.
 * @returns {string[]} - List of HTML file paths.
 */
function getHtmlFiles(dir) {
  let htmlFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      htmlFiles = htmlFiles.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  });

  return htmlFiles;
}

/**
 * Updates the HTML file content by replacing the specified block.
 * @param {string} filePath - The HTML file path.
 */
function updateHtmlFile(filePath) {
  try {
    // Regular expression to match the old block, accounting for variations in spaces and line breaks
    const oldBlockRegex = /<li>\s*<a\s+href="https:\/\/wwwcontent\.com"\s+target="blank"\s+class="gitbook-link">\s*Published\s+with\s+GitBook\s*<\/a>\s*<\/li>/gi;

    const newBlock = `
<li>
        <a href="https://honoprotocol.com" target="blank" >
            Made with ❤️ by HONO Protocol
        </a>
    </li>`;

    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the old block with the new block
    if (oldBlockRegex.test(content)) {
      content = content.replace(oldBlockRegex, newBlock);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to update ${filePath}:`, error.message);
  }
}

/**
 * Main function to execute the required tasks.
 */
function main() {
  const bookDir = path.resolve('_book');

  if (!fs.existsSync(bookDir)) {
    console.error('The "_book" directory does not exist.');
    process.exit(1);
  }

  // Get all HTML files in the directory and its subdirectories
  const htmlFiles = getHtmlFiles(bookDir);

  // Update each HTML file
  htmlFiles.forEach(updateHtmlFile);
}

// Run the script
main();
