import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for JSON to Markdown conversion
 */
export interface JsonToMarkdownOptions {
  /**
   * Minimum heading level (1-6)
   */
  minHeadingLevel?: number;
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
  /**
   * Use ordered lists when depth exceeds max heading level
   */
  useOrderedLists?: boolean;
}

/**
 * Default options for conversion
 */
const defaultOptions: JsonToMarkdownOptions = {
  minHeadingLevel: 1,
  maxHeadingLevel: 6,
  includeTypes: false,
  processArrayObjects: true,
  useOrderedLists: false,
};

/**
 * Convert a JSON object to Markdown
 */
export function jsonToMarkdown(
  json: Record<string, any>,
  options: JsonToMarkdownOptions = {}
): string {
  const mergedOptions = { ...defaultOptions, ...options };
  return processObject(json, mergedOptions.minHeadingLevel || 1, mergedOptions);
}

/**
 * Process a JSON object recursively
 */
function processObject(
  obj: Record<string, any>,
  level: number,
  options: JsonToMarkdownOptions
): string {
  const minLevel = options.minHeadingLevel || 1;
  const maxLevel = options.maxHeadingLevel || 6;
  
  // Determine if we should use headings or lists
  const isWithinHeadingLevels = level <= maxLevel;
  const headingLevel = isWithinHeadingLevels 
    ? Math.max(minLevel, Math.min(level, maxLevel)) 
    : maxLevel;
  
  // How deep are we beyond heading levels (for list indentation)
  const listDepth = isWithinHeadingLevels ? 0 : level - maxLevel;
  
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (isWithinHeadingLevels) {
      // Use headings for this level
      lines.push(`${'#'.repeat(headingLevel)} ${key}`);
      lines.push('');
    } else {
      // Use lists for this level
      const indent = '  '.repeat(listDepth - 1);
      const listMarker = options.useOrderedLists ? `${listDepth}. ` : '- ';
      lines.push(`${indent}${listMarker}**${key}**:`);
    }
    
    if (value === null) {
      lines.push(isWithinHeadingLevels ? 'null' : ' null');
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // For nested objects, recursively process
      // If we're already using lists, don't add extra spacing
      if (!isWithinHeadingLevels) lines.push('');
      lines.push(processObject(value, level + 1, options));
      if (!isWithinHeadingLevels) lines.push('');
    } else {
      // Format the value
      if (options.valueFormatter) {
        const formatted = options.valueFormatter(value, key, level);
        lines.push(isWithinHeadingLevels ? formatted : ` ${formatted}`);
      } else {
        if (Array.isArray(value)) {
          if (options.processArrayObjects && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
            // Process array of objects more intelligently
            if (isWithinHeadingLevels) {
              lines.push(processArrayOfObjects(value, level + 1, options));
            } else {
              // If we're in list mode, each array item gets its own sub-list
              const nestedIndent = '  '.repeat(listDepth);
              lines.push('');
              value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                  // Format as an object within the list
                  const subListMarker = options.useOrderedLists ? `${index + 1}. ` : '- ';
                  if (Object.keys(item).length > 0) {
                    lines.push(`${nestedIndent}${subListMarker}Item:`);
                    lines.push('');
                    const processedItem = processObject(item, level + 2, options)
                      .split('\n')
                      .map(line => `${nestedIndent}  ${line}`)
                      .join('\n');
                    lines.push(processedItem);
                    lines.push('');
                  }
                } else {
                  // Format as a simple value within the list
                  const subListMarker = options.useOrderedLists ? `${index + 1}. ` : '- ';
                  lines.push(`${nestedIndent}${subListMarker}${item}`);
                }
              });
            }
          } else {
            // Format arrays as lists
            if (isWithinHeadingLevels) {
              lines.push(...value.map(item => {
                if (typeof item === 'object' && item !== null) {
                  return `- ${JSON.stringify(item)}`;
                }
                return `- ${item}`;
              }));
            } else {
              // Nested lists within a list
              const nestedIndent = '  '.repeat(listDepth);
              lines.push('');
              value.forEach((item, index) => {
                const subListMarker = options.useOrderedLists ? `${index + 1}. ` : '- ';
                lines.push(`${nestedIndent}${subListMarker}${item}`);
              });
            }
          }
        } else {
          // Format primitives
          if (options.includeTypes) {
            lines.push(isWithinHeadingLevels 
              ? `*Type: ${typeof value}*` 
              : ` *Type: ${typeof value}*`);
            if (isWithinHeadingLevels) lines.push('');
          }
          lines.push(isWithinHeadingLevels ? `${value}` : ` ${value}`);
        }
      }
    }
    
    if (isWithinHeadingLevels) lines.push('');
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
  const minLevel = options.minHeadingLevel || 1;
  const maxLevel = options.maxHeadingLevel || 6;
  
  // Determine if we should use headings or lists
  const isWithinHeadingLevels = level <= maxLevel;
  const headingLevel = isWithinHeadingLevels 
    ? Math.max(minLevel, Math.min(level, maxLevel)) 
    : maxLevel;
  
  // How deep are we beyond heading levels (for list indentation)
  const listDepth = isWithinHeadingLevels ? 0 : level - maxLevel;
  
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
  
  if (identifierField && isWithinHeadingLevels) {
    // If we have identified a common identifier field, use it for structure (in heading mode)
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
  } else if (isWithinHeadingLevels) {
    // Default handling for arrays of objects without common identifier (in heading mode)
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
  } else {
    // We're beyond heading levels, use lists
    const indent = '  '.repeat(listDepth - 1);
    
    arr.forEach((item, index) => {
      const listMarker = options.useOrderedLists ? `${index + 1}. ` : '- ';
      
      if (typeof item === 'object' && item !== null) {
        if (identifierField && identifierField in item) {
          // Use identifier in the list item
          const identifier = item[identifierField as string];
          lines.push(`${indent}${listMarker}**${identifier}**:`);
          
          // Process the rest of the object properties
          const objWithoutIdentifier = { ...item };
          delete objWithoutIdentifier[identifierField as string];
          
          if (Object.keys(objWithoutIdentifier).length > 0) {
            lines.push('');
            const processedItem = processObject(objWithoutIdentifier, level + 1, options)
              .split('\n')
              .map(line => `${indent}  ${line}`)
              .join('\n');
            lines.push(processedItem);
          }
        } else {
          // No identifier, just process the whole object
          lines.push(`${indent}${listMarker}Item ${index + 1}:`);
          lines.push('');
          const processedItem = processObject(item, level + 1, options)
            .split('\n')
            .map(line => `${indent}  ${line}`)
            .join('\n');
          lines.push(processedItem);
        }
      } else {
        // Simple value
        lines.push(`${indent}${listMarker}${item}`);
      }
      
      lines.push('');
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