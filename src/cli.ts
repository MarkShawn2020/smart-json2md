#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { convertJsonFileToMarkdown, JsonToMarkdownOptions } from './index';

// Read package version dynamically
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageVersion = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version;

const program = new Command();

program
  .name('smart-json2md')
  .description('Convert JSON files to Markdown with automatic hierarchy')
  .version(packageVersion)
  .argument('<input>', 'Input JSON file path')
  .option('-o, --output <output>', 'Output Markdown file path')
  .option('-t, --types', 'Include type information')
  .option('-l, --max-level <level>', 'Maximum heading level (1-6)', '6')
  .option('-m, --min-level <level>', 'Minimum heading level (1-6)', '1')
  .option('-n, --no-process-arrays', 'Disable intelligent array processing')
  .option('-p, --pretty', 'Make output more readable with extra spacing')
  .option('-r, --ordered-lists', 'Use ordered lists for content beyond max heading level')
  .action(async (input, options) => {
    try {
      // Validate input file exists
      if (!fs.existsSync(input)) {
        console.error(`Error: Input file not found: ${input}`);
        process.exit(1);
      }

      // Determine output file
      let outputFile = options.output;
      if (!outputFile) {
        const inputExt = path.extname(input);
        const basename = path.basename(input, inputExt);
        outputFile = path.join(path.dirname(input), `${basename}.md`);
      }

      // Validate heading levels
      const minLevel = parseInt(options.minLevel);
      const maxLevel = parseInt(options.maxLevel);
      
      if (minLevel < 1 || minLevel > 6) {
        console.error('Error: Minimum heading level must be between 1 and 6');
        process.exit(1);
      }
      
      if (maxLevel < 1 || maxLevel > 6) {
        console.error('Error: Maximum heading level must be between 1 and 6');
        process.exit(1);
      }
      
      if (minLevel > maxLevel) {
        console.error('Error: Minimum heading level cannot be greater than maximum heading level');
        process.exit(1);
      }

      console.log(`Converting ${input} to ${outputFile}...`);

      // Setup conversion options
      const conversionOptions: JsonToMarkdownOptions = {
        includeTypes: options.types,
        minHeadingLevel: minLevel,
        maxHeadingLevel: maxLevel,
        processArrayObjects: options.processArrays,
        useOrderedLists: options.orderedLists
      };

      if (options.pretty) {
        conversionOptions.valueFormatter = (value, key, level) => {
          if (typeof value === 'string') {
            return `${value}\n`;
          } else if (Array.isArray(value)) {
            const items = value.map(item => {
              if (typeof item === 'object' && item !== null) {
                return `- ${JSON.stringify(item, null, 2)}`;
              }
              return `- ${item}`;
            });
            return items.join('\n\n') + '\n';
          } else {
            return `${value}\n`;
          }
        };
      }

      // Convert file
      await convertJsonFileToMarkdown(input, outputFile, conversionOptions);
      
      console.log('Conversion completed successfully!');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse(process.argv); 