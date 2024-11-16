const fs = require('fs');
const path = require('path');

/**
 * Updates the Twitter share URL in the specified file.
 * @param {string} filePath - The path to the file.
 */
function updateTwitterShare(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');

    // Regular expression to match the window.open for Twitter with the incorrect URL
    const twitterShareRegex = /window\.open\(['"]http:\/\/twitter\.com\/home\?status\+encodeURIComponent\(document\.title\+\'\s\+location\.href\)\)['"]/g;

    // The new URL for a valid Twitter share link
    const validTwitterShare = `window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title + ' ' + location.href))`;

    // Replace the old code with the new one
    if (twitterShareRegex.test(content)) {
      content = content.replace(twitterShareRegex, validTwitterShare);

      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated Twitter share URL in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to update ${filePath}:`, error.message);
  }
}

/**
 * Main function to execute the task.
 */
function main() {
  const filePath = path.resolve('_book/gitbook/gitbook-plugin-sharing/buttons.js');

  if (!fs.existsSync(filePath)) {
    console.error('The file "_book/gitbook/gitbook-plugin-sharing/buttons.js" does not exist.');
    process.exit(1);
  }

  // Update the file
  updateTwitterShare(filePath);
}

// Run the script
main();
