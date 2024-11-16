const fs = require('fs');
const path = require('path');

// Manifest content
const manifestContent = `{
    "name": "HONO Protocol Documentation",
    "short_name": "HONO Docs",
    "icons": [{
        "src": "/content/assets/favicon/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
    }, {
        "src": "/content/assets/favicon/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
    }],
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone"
}`;

// New favicon tags
const faviconTags = `
<link rel="apple-touch-icon" sizes="180x180" href="/content/assets/favicon/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/content/assets/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/content/assets/favicon/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
`;

// Tags to remove
const removeTags = [
  /<meta name="apple-mobile-web-app-capable" content="yes">/gi,
  /<meta name="apple-mobile-web-app-status-bar-style" content="black">/gi,
  /<link rel="apple-touch-icon-precomposed" sizes="152x152" href="gitbook\/images\/apple-touch-icon-precomposed-152.png">/gi,
  /<link rel="shortcut icon" href="gitbook\/images\/favicon.ico" type="image\/x-icon">/gi
];

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
 * Updates an HTML file by removing specified tags and updating favicon-related tags.
 * @param {string} filePath - The HTML file path
 */
function updateHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove specified tags
    removeTags.forEach(regex => {
      content = content.replace(regex, '');
    });

    // Replace favicon tags
    const headTagRegex = /<head>([\s\S]*?)<\/head>/i;
    const faviconRegex = /<link[^>]*rel=["'](?:icon|apple-touch-icon)["'][^>]*>/gi;

    content = content.replace(headTagRegex, (match, headContent) => {
      const cleanedHead = headContent.replace(faviconRegex, '');
      return `<head>${cleanedHead}${faviconTags}</head>`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Failed to update ${filePath}:`, error.message);
  }
}

/**
 * Deletes a directory and its contents.
 * @param {string} dirPath - Path to the directory
 */
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        deleteDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`Deleted directory: ${dirPath}`);
  }
}

/**
 * Copies all files from one directory to another.
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 */
function copyFiles(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stats = fs.statSync(srcPath);

    if (stats.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file} to ${destDir}`);
    }
  });
}

/**
 * Renames a directory.
 * @param {string} oldPath - The current directory path
 * @param {string} newPath - The new directory path
 */
function renameDirectory(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldPath} to ${newPath}`);
  } else {
    console.error(`Directory "${oldPath}" does not exist.`);
  }
}

/**
 * Main function to execute the required tasks.
 */
function main() {
  const bookDir = path.resolve('_book');
  const gitbookDir = path.join(bookDir, '.gitbook');
  const contentDir = path.join(bookDir, 'content');
  const faviconSrcDir = path.resolve('./favicon');
  const faviconDestDir = path.join(contentDir, 'assets/favicon');
  const manifestPath = path.join(bookDir, 'site.webmanifest');
  const oldFaviconDir = path.join(bookDir, 'favicon');

  if (!fs.existsSync(bookDir)) {
    console.error('The "_book" directory does not exist.');
    process.exit(1);
  }

  // Step 1: Rename _book/.gitbook to _book/content
  renameDirectory(gitbookDir, contentDir);

  // Step 2: Copy favicon files
  if (fs.existsSync(faviconSrcDir)) {
    copyFiles(faviconSrcDir, faviconDestDir);
  } else {
    console.error(`The source favicon directory "${faviconSrcDir}" does not exist.`);
  }

  // Step 3: Delete _book/favicon directory
  deleteDirectory(oldFaviconDir);

  // Step 4: Create site.webmanifest
  fs.writeFileSync(manifestPath, manifestContent, 'utf8');
  console.log(`Created site.webmanifest in: ${manifestPath}`);

  // Step 5: Update all HTML files
  const htmlFiles = getHtmlFiles(bookDir);
  htmlFiles.forEach(updateHtmlFile);
}

// Run the script
main();
