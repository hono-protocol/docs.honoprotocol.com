const fs = require('fs');
const path = require('path');

// The prefix to prepend to the <title> content
const prefix = "HONO Protocol - ";

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
 * Prepends a prefix to the <title> tag content in an HTML file.
 * @param {string} filePath - The HTML file path
 */
function prependToTitle(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const titleRegex = /<title>(.*?)<\/title>/;

    // Check if a <title> tag exists and doesn't already start with the prefix
    if (titleRegex.test(content)) {
      const match = content.match(titleRegex);
      const titleContent = match[1];

      if (!titleContent.startsWith(prefix)) {
        const updatedTitle = `<title>${prefix}${titleContent}</title>`;
        content = content.replace(titleRegex, updatedTitle);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated title in: ${filePath}`);
      } else {
        console.log(`Title already prefixed in: ${filePath}`);
      }
    } else {
      console.log(`No <title> tag found in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to update ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error('Usage: node prepend-title.js <target-directory>');
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

  htmlFiles.forEach(prependToTitle);
}

// Run the script
main();
