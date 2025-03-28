# smart-json2md

A simple utility to convert plain JSON files to hierarchical Markdown documents with intelligent structuring.

## Features

- Automatically converts JSON objects to Markdown with headings based on hierarchy
- Supports nested objects with appropriate heading levels
- Handles deep structures by converting to lists when exceeding configured heading levels
- Arrays are displayed as Markdown lists
- Intelligently processes arrays of objects with common structure
- Configurable minimum and maximum heading levels
- Option to use ordered or unordered lists for deep structures
- Option to include type information for values
- Easy to use CLI and programmatic API

## Installation

```bash
npm install smart-json2md
```

Or globally:

```bash
npm install -g smart-json2md
```

## CLI Usage

```bash
smart-json2md input.json -o output.md
```

### Options

```
Usage: smart-json2md [options] <input>

Convert JSON files to Markdown with automatic hierarchy

Arguments:
  input                  Input JSON file path

Options:
  -V, --version          output the version number
  -o, --output <output>  Output Markdown file path
  -t, --types            Include type information
  -l, --max-level <level>  Maximum heading level (1-6) (default: "6")
  -m, --min-level <level>  Minimum heading level (1-6) (default: "1")
  -n, --no-process-arrays  Disable intelligent array processing
  -p, --pretty           Make output more readable with extra spacing
  -r, --ordered-lists    Use ordered lists for content beyond max heading level
  -h, --help             display help for command
```

## Programmatic Usage

```javascript
import { jsonToMarkdown, convertJsonFileToMarkdown } from 'smart-json2md';

// Convert a JSON object directly
const json = {
  person: {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        details: {
          region: 'Northeast',
          country: 'USA'
        }
      }
    },
    hobbies: ['reading', 'hiking', 'coding'],
    contacts: [
      { type: 'email', value: 'john@example.com' },
      { type: 'phone', value: '555-1234' }
    ]
  }
};

// Basic conversion
const markdown = jsonToMarkdown(json);
console.log(markdown);

// Advanced options
const advancedMarkdown = jsonToMarkdown(json, {
  minHeadingLevel: 2,      // Start with h2 headings instead of h1
  maxHeadingLevel: 4,      // Only use headings up to h4
  includeTypes: true,      // Include data types
  useOrderedLists: true,   // Use numbered lists for deep structures
  processArrayObjects: true // Enabled by default
});
console.log(advancedMarkdown);

// Convert a file
await convertJsonFileToMarkdown('input.json', 'output.md', {
  minHeadingLevel: 1,
  maxHeadingLevel: 4,
  useOrderedLists: true
});
```

## Example: Deep Structure Handling

Given a deeply nested JSON:

```json
{
  "level1": {
    "level2": {
      "level3": {
        "level4": {
          "level5": {
            "level6": {
              "level7": "This is very deep"
            }
          }
        }
      }
    }
  }
}
```

With `maxHeadingLevel: 4` and `useOrderedLists: true`, the result will be:

```markdown
# level1

## level2

### level3

#### level4

1. **level5**:
  
  1. **level6**:
    
    1. **level7**: This is very deep

```

Notice how levels beyond the 4th (max heading level) automatically convert to ordered lists.

## Advanced Options

The library provides several options for customizing the conversion:

- `minHeadingLevel`: Starting heading level (1-6, default: 1)
- `maxHeadingLevel`: Maximum heading level (1-6, default: 6)
- `includeTypes`: Add type information for values
- `processArrayObjects`: Enable smart processing of arrays containing objects
- `useOrderedLists`: Use numbered lists instead of bullet points for deep structures
- `valueFormatter`: Custom function to format specific values

## License

MIT 