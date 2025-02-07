const rootDir = __dirname;
const fs = require('fs');

const versionFilePath = `${rootDir}/../packages/sdk/ios/Sources/version.swift`;

// Load files
const packageJsonVersion = require(`${rootDir}/../packages/sdk/package.json`).version;
const versionFileContents = fs.readFileSync(versionFilePath).toString();

// Update version
const newVersionFileContents = versionFileContents.replace(/"\d+\.\d+\.\d+"/, `"${packageJsonVersion}"`);
fs.writeFileSync(versionFilePath, newVersionFileContents);
