#!/usr/bin/env node

/**
 * Demo script to showcase various conversion options
 */
const { jsonToMarkdown } = require('../dist/index');
const fs = require('fs');
const path = require('path');

// Sample JSON data
const sampleData = {
  blog: {
    title: "JSON to Markdown Converter",
    description: "A tool to convert JSON to hierarchical Markdown",
    author: {
      name: "John Doe",
      email: "john@example.com"
    },
    categories: ["tools", "markdown", "json", "converter"],
    posts: [
      {
        title: "Getting Started",
        date: "2023-01-01",
        content: "This is how you get started with the tool...",
        tags: ["beginner", "tutorial"]
      },
      {
        title: "Advanced Usage",
        date: "2023-02-15",
        content: "Advanced techniques for power users...",
        tags: ["advanced", "tips"]
      }
    ],
    settings: {
      theme: "dark",
      notifications: true,
      language: "en-US"
    }
  }
};

// Directory to save output files
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Generate different versions with various options
const generateExamples = () => {
  // Default options
  const defaultMarkdown = jsonToMarkdown(sampleData);
  fs.writeFileSync(path.join(outputDir, 'default.md'), defaultMarkdown);
  console.log('Generated default.md');

  // With type information
  const withTypes = jsonToMarkdown(sampleData, { includeTypes: true });
  fs.writeFileSync(path.join(outputDir, 'with-types.md'), withTypes);
  console.log('Generated with-types.md');

  // With max heading level of 3
  const maxLevel3 = jsonToMarkdown(sampleData, { maxHeadingLevel: 3 });
  fs.writeFileSync(path.join(outputDir, 'max-level-3.md'), maxLevel3);
  console.log('Generated max-level-3.md');

  // Without array processing
  const noArrayProcessing = jsonToMarkdown(sampleData, { processArrayObjects: false });
  fs.writeFileSync(path.join(outputDir, 'no-array-processing.md'), noArrayProcessing);
  console.log('Generated no-array-processing.md');

  // Custom value formatter
  const customFormatter = jsonToMarkdown(sampleData, {
    valueFormatter: (value, key, level) => {
      if (typeof value === 'string') {
        return `"${value}"`; // Add quotes around strings
      } else if (Array.isArray(value)) {
        return value.map(item => `* ${item}`).join('\n'); // Use * instead of -
      } else {
        return `${value}`;
      }
    }
  });
  fs.writeFileSync(path.join(outputDir, 'custom-formatter.md'), customFormatter);
  console.log('Generated custom-formatter.md');
};

// Run the examples
generateExamples();
console.log(`All examples generated in ${outputDir}`); 