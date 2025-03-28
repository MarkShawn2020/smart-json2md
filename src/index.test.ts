import { jsonToMarkdown } from './index';

describe('jsonToMarkdown', () => {
  it('should convert a simple JSON object to Markdown', () => {
    const json = {
      hello: 'world',
      number: 42
    };
    
    const result = jsonToMarkdown(json);
    expect(result).toContain('# hello');
    expect(result).toContain('world');
    expect(result).toContain('# number');
    expect(result).toContain('42');
  });
  
  it('should handle nested objects with appropriate heading levels', () => {
    const json = {
      person: {
        name: 'John',
        details: {
          age: 30
        }
      }
    };
    
    const result = jsonToMarkdown(json);
    expect(result).toContain('# person');
    expect(result).toContain('## name');
    expect(result).toContain('John');
    expect(result).toContain('## details');
    expect(result).toContain('### age');
    expect(result).toContain('30');
  });
  
  it('should format arrays as lists', () => {
    const json = {
      hobbies: ['reading', 'running', 'coding']
    };
    
    const result = jsonToMarkdown(json);
    expect(result).toContain('# hobbies');
    expect(result).toContain('- reading');
    expect(result).toContain('- running');
    expect(result).toContain('- coding');
  });
  
  it('should respect the maxHeadingLevel option', () => {
    const json = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: 'deep value'
            }
          }
        }
      }
    };
    
    const result = jsonToMarkdown(json, { maxHeadingLevel: 3 });
    expect(result).toContain('# level1');
    expect(result).toContain('## level2');
    expect(result).toContain('### level3');
    expect(result).toContain('### level4');  // Should be capped at level 3
    expect(result).toContain('### level5');  // Should be capped at level 3
    expect(result).toContain('deep value');
  });
  
  it('should include type information when includeTypes is true', () => {
    const json = {
      name: 'John',
      age: 30,
      active: true
    };
    
    const result = jsonToMarkdown(json, { includeTypes: true });
    expect(result).toContain('*Type: string*');
    expect(result).toContain('*Type: number*');
    expect(result).toContain('*Type: boolean*');
  });
}); 