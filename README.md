# smart-json2md

A simple utility to convert plain JSON files to hierarchical Markdown documents with intelligent structuring.

## Features

- Automatically converts JSON objects to Markdown with headings based on hierarchy
- Supports nested objects with appropriate heading levels
- Arrays are displayed as Markdown lists
- Intelligently processes arrays of objects with common structure
- Configurable maximum heading level
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
  -n, --no-process-arrays  Disable intelligent array processing
  -p, --pretty           Make output more readable with extra spacing
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
      city: 'Anytown'
    },
    hobbies: ['reading', 'hiking', 'coding'],
    contacts: [
      { type: 'email', value: 'john@example.com' },
      { type: 'phone', value: '555-1234' }
    ]
  }
};

const markdown = jsonToMarkdown(json);
console.log(markdown);

// Or convert a file
await convertJsonFileToMarkdown('input.json', 'output.md', {
  includeTypes: true,
  maxHeadingLevel: 4,
  processArrayObjects: true // enabled by default
});
```

## Example

Given this JSON:

```json
{
  "blog": {
    "title": "My Technical Blog",
    "author": "Jane Smith",
    "posts": [
      {
        "title": "Getting Started with JSON",
        "date": "2023-01-01",
        "content": "JSON is a lightweight data format..."
      },
      {
        "title": "Converting JSON to Markdown",
        "date": "2023-02-01",
        "content": "In this post, we'll explore..."
      }
    ]
  }
}
```

The resulting Markdown will be:

```markdown
# blog

## title
My Technical Blog

## author
Jane Smith

## posts

### Getting Started with JSON

#### date
2023-01-01

#### content
JSON is a lightweight data format...

### Converting JSON to Markdown

#### date
2023-02-01

#### content
In this post, we'll explore...
```

Notice how the array of post objects is intelligently processed using the "title" field as subheadings.

## Advanced Options

The library provides several options for customizing the conversion:

- `maxHeadingLevel`: Limit the maximum heading level (1-6)
- `includeTypes`: Add type information for values
- `processArrayObjects`: Enable smart processing of arrays containing objects
- `valueFormatter`: Custom function to format specific values

## License

MIT 