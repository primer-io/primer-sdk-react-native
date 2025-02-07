const fs = require('fs');
const path = require('path');

const REPORTS_DIR_NAME = '.nyc_output';
const PACKAGES_DIR_NAME = 'packages';
const PACKAGE_PATH = path.resolve(process.cwd(), PACKAGES_DIR_NAME);
const REPORTS_DIR_PATH = path.resolve(process.cwd(), REPORTS_DIR_NAME);

// Function to create a temporary directory if it doesn't exist
function createTempDir() {
  if (!fs.existsSync(REPORTS_DIR_PATH)) {
    fs.mkdirSync(REPORTS_DIR_PATH);
  }
}

// Function to recursively find 'coverage' folders within a directory
function findCoverageFolders(directory, maxDepth = 5, currentDepth = 0) {
  let coverageFolders = [];

  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      if (file === 'coverage') {
        coverageFolders.push(filePath);
      } else if (currentDepth < maxDepth) {
        const subdirectoryCoverageFolders = findCoverageFolders(filePath, maxDepth, currentDepth + 1);
        coverageFolders = coverageFolders.concat(subdirectoryCoverageFolders);
      }
    }
  }

  return coverageFolders;
}

// Function to generate reports by copying coverage files to a temporary directory
function generateReports() {
  const coverageFolders = findCoverageFolders(PACKAGE_PATH);
  console.log(coverageFolders);

  coverageFolders.forEach(coverageFolder => {
    const coverageFinalFilePath = path.resolve(coverageFolder, 'coverage-final.json');

    fs.stat(coverageFinalFilePath, (error, stats) => {
      if (error) {
        console.error(`Error accessing file: ${coverageFinalFilePath}`, error);
        return;
      }

      try {
        const packageName = coverageFolder.split('/').slice(-2)[0];
        const destFilePath = path.resolve(REPORTS_DIR_PATH, `${packageName}.json`);

        if (fs.existsSync(coverageFinalFilePath)) {
          fs.copyFileSync(coverageFinalFilePath, destFilePath);
          console.log(`Report generated for ${packageName}`);
        } else {
          console.warn(`Coverage file not found: ${coverageFinalFilePath}`);
        }
      } catch (error) {
        console.error('Failed to generate reports', error);
      }
    });
  });
}

// Main function to aggregate reports
function aggregateReports() {
  createTempDir();
  generateReports();
}

// Start the aggregation process
aggregateReports();
