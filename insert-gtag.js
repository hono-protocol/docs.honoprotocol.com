const fs = require('fs');
const path = require('path');

// The Google tag code to be inserted
const googleTag = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-T5ZSKEGQ39"></script>`;

/**
 * Recursively get all HTML files in a directory.
 * @param {string} dir - Directory path to search
 * @returns {string[]} - List of HTML file paths
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
 * Inserts the Google Tag code before the closing </body> tag in an HTML file.
 * @param {string} filePath - The HTML file path
 */
function insertGoogleTag(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(googleTag)) {
      console.log(`Google Tag already present in: ${filePath}`);
      return;
    }

    const updatedContent = content.replace(
      '</body>',
      `${googleTag}\n</body>`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Google Tag inserted into: ${filePath}`);
  } catch (error) {
    console.error(`Failed to update ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error('Usage: node insert-gtag.js <target-directory>');
    process.exit(1);
  }

  const absoluteDir = path.resolve(targetDir);
  if (!fs.existsSync(absoluteDir)) {
    console.error('The specified directory does not exist.');
    process.exit(1);
  }

  const htmlFiles = getHtmlFiles(absoluteDir);

  if (htmlFiles.length === 0) {
    console.log('No HTML files found in the specified directory.');
    return;
  }

  htmlFiles.forEach(insertGoogleTag);
}

// Run the script
main();
