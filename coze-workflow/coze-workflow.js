// smart-json2md工作流：将JSON转换为结构化Markdown文档

/**
 * 将JSON对象转换为Markdown的函数
 */
function jsonToMarkdown(
  json,
  options = {}
) {
  // 默认选项
  const defaultOptions = {
    minHeadingLevel: 1,
    maxHeadingLevel: 6,
    includeTypes: false,
    useOrderedLists: false,
  };
  
  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 处理JSON对象
  return processObject(json, mergedOptions.minHeadingLevel, mergedOptions);
}

/**
 * 递归处理JSON对象
 */
function processObject(
  obj,
  level,
  options
) {
  const minLevel = options.minHeadingLevel;
  const maxLevel = options.maxHeadingLevel;
  
  // 判断是否在标题级别范围内
  const isWithinHeadingLevels = level <= maxLevel;
  const headingLevel = isWithinHeadingLevels 
    ? Math.max(minLevel, Math.min(level, maxLevel)) 
    : maxLevel;
  
  // 超出标题级别时的缩进深度
  const listDepth = isWithinHeadingLevels ? 0 : level - maxLevel;
  
  const lines = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (isWithinHeadingLevels) {
      // 使用标题格式
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push(`${'#'.repeat(headingLevel)} ${key}`);
      lines.push('');
    } else {
      // 使用列表格式
      const indent = '  '.repeat(listDepth - 1);
      const listMarker = options.useOrderedLists ? `${listDepth}. ` : '- ';
      lines.push(`${indent}${listMarker}**${key}**:`);
    }
    
    // 根据值类型处理
    if (value === null) {
      lines.push(isWithinHeadingLevels ? 'null' : ' null');
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // 嵌套对象递归处理
      if (!isWithinHeadingLevels) lines.push('');
      lines.push(processObject(value, level + 1, options));
      if (!isWithinHeadingLevels) lines.push('');
    } else if (Array.isArray(value)) {
      // 处理数组
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // 处理对象数组
        lines.push(processArrayOfObjects(value, level + 1, options));
      } else {
        // 处理普通数组
        value.forEach(item => {
          lines.push(`- ${item}`);
        });
      }
    } else {
      // 处理基本类型
      if (options.includeTypes) {
        lines.push(isWithinHeadingLevels 
          ? `*Type: ${typeof value}*` 
          : ` *Type: ${typeof value}*`);
        if (isWithinHeadingLevels) lines.push('');
      }
      lines.push(isWithinHeadingLevels ? `${value}` : ` ${value}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * 处理对象数组
 */
function processArrayOfObjects(
  arr,
  level,
  options
) {
  // 简化实现：将对象数组转为列表
  const lines = [];
  
  arr.forEach((item, index) => {
    if (typeof item === 'object' && item !== null) {
      const identifierFields = ['title', 'name', 'id', 'key'];
      let identifier = `Item ${index + 1}`;
      
      // 查找可能的标识符字段
      for (const field of identifierFields) {
        if (field in item) {
          identifier = item[field];
          break;
        }
      }
      
      lines.push(`- **${identifier}**:`);
      
      // 处理对象的其他属性
      Object.entries(item).forEach(([key, value]) => {
        if (identifierFields.includes(key) && item[key] === identifier) {
          return; // 跳过已作为标识符的字段
        }
        lines.push(`  - ${key}: ${value}`);
      });
    } else {
      lines.push(`- ${item}`);
    }
  });
  
  return lines.join('\n');
}

async function main({ params }) {
  try {
    // 获取输入参数
    let jsonData = params.jsonContent;
    
    // 如果输入是字符串，尝试解析为JSON对象
    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch (error) {
        return {
          code: 400,
          data: null,
          message: "JSON解析失败，请检查输入格式",
          error: String(error)
        };
      }
    }
    
    // 验证输入是否为对象
    if (typeof jsonData !== 'object' || jsonData === null) {
      return {
        code: 400,
        data: null,
        message: "输入必须是有效的JSON对象"
      };
    }
    
    // 转换选项
    const options = {
      minHeadingLevel: parseInt(params.minHeadingLevel) || 1,
      maxHeadingLevel: parseInt(params.maxHeadingLevel) || 6,
      includeTypes: params.includeTypes === true,
      useOrderedLists: params.useOrderedLists === true
    };
    
    // 执行转换
    const markdownContent = jsonToMarkdown(jsonData, options);
    
    // 返回结果 - 将data简化为字符串
    return {
      code: 200,
      data: markdownContent,
      message: "转换成功"
    };
  } catch (error) {
    // 处理可能的错误
    return {
      code: 500,
      data: null,
      message: "转换过程中发生错误",
      error: String(error)
    };
  }
} 