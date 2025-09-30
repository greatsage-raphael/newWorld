// Import necessary modules from Node.js
// 'fs/promises' for modern, promise-based file system operations
// 'path' for handling and transforming file paths
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Recursively reads all files in a directory and its subdirectories,
 * and returns their combined text content.
 * @param {string} dirPath - The path to the directory to scrape.
 * @returns {Promise<string>} A promise that resolves to the combined text of all files.
 */
async function scrapeAllTextFromDir(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    const contentPromises = entries.map(async (entry) => {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        return scrapeAllTextFromDir(fullPath);
      } else if (entry.isFile()) {
        const fileContent = await readFile(fullPath, 'utf8');
        return `
// ======================================================
// --- Content from: ${fullPath.replace(/\\/g, '/')}
// ======================================================

${fileContent}
`;
      }
      return ''; // Ignore other types like symlinks
    });

    const allContents = await Promise.all(contentPromises);
    return allContents.join('');

  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return a specific error message if the directory doesn't exist.
      return `// ERROR: Directory not found at '${dirPath}'`;
    }
    // For other errors, log them and return an error message in the text.
    console.error(`Error reading directory ${dirPath}:`, error);
    return `// ERROR: Failed to read directory '${dirPath}'. See console for details.`;
  }
}

// --- Main Execution ---
(async () => {
  const targetDirectory = './src';
  const outputFilePath = 'full_code.txt'; // The name of the output file

  console.log(`--- Scraping all text from '${targetDirectory}'...`);

  try {
    const allText = await scrapeAllTextFromDir(targetDirectory);

    // Write the combined text to the specified output file.
    // This will create the file if it doesn't exist, or overwrite it if it does.
    await writeFile(outputFilePath, allText, 'utf8');
    
    console.log(`\n--- ✅ Success! All code has been saved to ${outputFilePath}. ---`);

  } catch (error) {
    console.error(`\n--- ❌ An critical error occurred during the process: ---`);
    console.error(error);
  }
})();