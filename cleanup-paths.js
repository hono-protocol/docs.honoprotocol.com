const fs = require('fs');
const path = require('path');

/**
 * Recursively gets all HTML files in a directory.
 * @param {string} dir - The directory to search.
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
 * Updates an HTML file to replace `.gitbook` with `content` in file paths
 * and replaces all backslashes (`\`) with `<br>`.
 * @param {string} filePath - The HTML file path.
 */
function updateHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace `.gitbook` with `content` in file paths
    content = content.replace(/\.gitbook/g, 'content');

    // Replace backslashes with <br>
    content = content.replace(/\\/g, '<br>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
