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
  .name('json-to-markdown')
  .description('Convert JSON files to Markdown with automatic hierarchy')
  .version(packageVersion)
  .argument('<input>', 'Input JSON file path')
  .option('-o, --output <output>', 'Output Markdown file path')
  .option('-t, --types', 'Include type information')
  .option('-l, --max-level <level>', 'Maximum heading level (1-6)', '6')
  .option('-n, --no-process-arrays', 'Disable intelligent array processing')
  .option('-p, --pretty', 'Make output more readable with extra spacing')
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

      console.log(`Converting ${input} to ${outputFile}...`);

      // Setup conversion options
      const conversionOptions: JsonToMarkdownOptions = {
        includeTypes: options.types,
        maxHeadingLevel: parseInt(options.maxLevel),
        processArrayObjects: options.processArrays
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