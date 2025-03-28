import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for JSON to Markdown conversion
 */
export interface JsonToMarkdownOptions {
  /**
   * Maximum heading level (1-6)
   */
  maxHeadingLevel?: number;
  /**
   * Include JSON type information
   */
  includeTypes?: boolean;
  /**
   * Custom formatter for values
   */
  valueFormatter?: (value: any, key: string, level: number) => string;
  /**
   * Process complex objects in arrays
   */
  processArrayObjects?: boolean;
}

/**
 * Default options for conversion
 */
const defaultOptions: JsonToMarkdownOptions = {
  maxHeadingLevel: 6,
  includeTypes: false,
  processArrayObjects: true,
};

/**
 * Convert a JSON object to Markdown
 */
export function jsonToMarkdown(
  json: Record<string, any>,
  options: JsonToMarkdownOptions = {}
): string {
  const mergedOptions = { ...defaultOptions, ...options };
  return processObject(json, 1, mergedOptions);
}

/**
 * Process a JSON object recursively
 */
function processObject(
  obj: Record<string, any>,
  level: number,
  options: JsonToMarkdownOptions
): string {
  const maxLevel = options.maxHeadingLevel || 6;
  const headingLevel = Math.min(level, maxLevel);
  
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    // Add the key as a heading
    lines.push(`${'#'.repeat(headingLevel)} ${key}`);
    lines.push('');
    
    if (value === null) {
      lines.push('null');
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // For nested objects, recursively process
      lines.push(processObject(value, level + 1, options));
    } else {
      // Format the value
      if (options.valueFormatter) {
        lines.push(options.valueFormatter(value, key, level));
      } else {
        if (Array.isArray(value)) {
          if (options.processArrayObjects && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
            // Process array of objects more intelligently
            lines.push(processArrayOfObjects(value, level + 1, options));
          } else {
            // Format arrays as lists
            lines.push(...value.map(item => {
              if (typeof item === 'object' && item !== null) {
                return `- ${JSON.stringify(item)}`;
              }
              return `- ${item}`;
            }));
          }
        } else {
          // Format primitives
          if (options.includeTypes) {
            lines.push(`*Type: ${typeof value}*`);
            lines.push('');
          }
          lines.push(`${value}`);
        }
      }
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Process an array of objects into a better markdown representation
 */
function processArrayOfObjects(
  arr: any[],
  level: number,
  options: JsonToMarkdownOptions
): string {
  const maxLevel = options.maxHeadingLevel || 6;
  const headingLevel = Math.min(level, maxLevel);
  
  // First, try to determine if all objects have a common structure
  // Look for a "name", "title", or "id" field to use as key
  const identifierFields = ['title', 'name', 'id', 'key'];
  let identifierField: string | null = null;
  
  for (const field of identifierFields) {
    if (arr.every(item => typeof item === 'object' && item !== null && field in item)) {
      identifierField = field;
      break;
    }
  }
  
  const lines: string[] = [];
  
  if (identifierField) {
    // If we have identified a common identifier field, use it for structure
    arr.forEach((item, index) => {
      // Use the identifier field as a subheading
      const identifier = item[identifierField as string];
      lines.push(`${'#'.repeat(headingLevel)} ${identifier}`);
      lines.push('');
      
      // Process the rest of the object properties
      const objWithoutIdentifier = { ...item };
      delete objWithoutIdentifier[identifierField as string];
      
      if (Object.keys(objWithoutIdentifier).length > 0) {
        lines.push(processObject(objWithoutIdentifier, level + 1, options));
      }
    });
  } else {
    // Default handling for arrays of objects without common identifier
    arr.forEach((item, index) => {
      lines.push(`${'#'.repeat(headingLevel)} Item ${index + 1}`);
      lines.push('');
      
      if (typeof item === 'object' && item !== null) {
        lines.push(processObject(item, level + 1, options));
      } else {
        lines.push(`${item}`);
        lines.push('');
      }
    });
  }
  
  return lines.join('\n');
}

/**
 * Read a JSON file and convert to Markdown
 */
export async function convertJsonFileToMarkdown(
  inputFile: string,
  outputFile?: string,
  options: JsonToMarkdownOptions = {}
): Promise<string> {
  try {
    const jsonContent = await fs.promises.readFile(inputFile, 'utf8');
    const jsonData = JSON.parse(jsonContent);
    const markdown = jsonToMarkdown(jsonData, options);
    
    if (outputFile) {
      await fs.promises.writeFile(outputFile, markdown, 'utf8');
    }
    
    return markdown;
  } catch (error) {
    console.error('Error converting JSON to Markdown:', error);
    throw error;
  }
}

export default {
  jsonToMarkdown,
  convertJsonFileToMarkdown,
}; 