import { Args } from '@/runtime';
import { jsonToMarkdown, JsonToMarkdownOptions } from 'smart-json2md';

/**
 * 输入参数定义
 */
export interface Input {
  /**
   * 要转换的JSON数据
   * @minimum_length 2
   * @description 要转换为Markdown的JSON字符串
   * @example "{\"title\":\"My Document\",\"content\":\"Hello World\",\"sections\":[{\"name\":\"Section 1\",\"text\":\"Content here\"}]}"
   */
  jsonData: string;

  /**
   * 转换选项
   * @description 可选的转换配置参数
   */
  options?: {
    /**
     * 最小标题级别 (1-6)
     * @minimum 1
     * @maximum 6
     * @default 1
     * @description 设置生成的Markdown中的最小标题级别
     */
    minHeadingLevel?: number;

    /**
     * 最大标题级别 (1-6)
     * @minimum 1
     * @maximum 6
     * @default 6
     * @description 设置生成的Markdown中的最大标题级别
     */
    maxHeadingLevel?: number;

    /**
     * 包含类型信息
     * @default false
     * @description 是否在输出中包含数据类型信息
     */
    includeTypes?: boolean;

    /**
     * 处理数组中的对象
     * @default true
     * @description 启用对数组中对象的智能处理
     */
    processArrayObjects?: boolean;

    /**
     * 使用有序列表
     * @default false
     * @description 当深度超过最大标题级别时，使用有序列表而非无序列表
     */
    useOrderedLists?: boolean;
  };
}

/**
 * 输出参数定义
 */
export interface Output {
  /**
   * 状态码
   * @description 200表示成功，其他为错误
   * @example 200
   */
  code: number;

  /**
   * 转换数据
   * @description 成功时返回转换后的Markdown内容，失败时为null
   * @example "# title\n\nMy Document\n\n# content\n\nHello World\n\n# sections\n\n## Section 1\n\n### text\n\nContent here"
   */
  data: string | null;

  /**
   * 转换结果消息
   * @description 成功或失败的提示信息
   * @example "转换成功"
   */
  message: string;
}

/**
 * JSON转Markdown的Coze插件
 * @param {Object} args.input - 输入参数，包含jsonData和options
 * @param {Object} args.logger - 日志实例，由运行时注入
 * @returns {Output} 返回统一格式的输出对象
 */
export async function handler({ input, logger }: Args<Input>): Promise<Output> {
  const { jsonData, options = {} } = input;

  logger.info('转换JSON到Markdown，选项:', JSON.stringify(options, null, 2));

  try {
    // 解析JSON字符串
    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (parseError) {
      logger.error('JSON解析失败:', parseError);
      return {
        code: 400,
        data: null,
        message: `无法解析JSON字符串: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      };
    }

    // 转换配置
    const convertOptions: JsonToMarkdownOptions = {
      minHeadingLevel: options.minHeadingLevel,
      maxHeadingLevel: options.maxHeadingLevel,
      includeTypes: options.includeTypes,
      processArrayObjects: options.processArrayObjects !== false, // 默认为true
      useOrderedLists: options.useOrderedLists
    };

    // 执行转换
    const markdown = jsonToMarkdown(parsedData, convertOptions);
    
    logger.info('转换成功，生成了Markdown文档');
    
    return {
      code: 200,
      data: markdown,
      message: "转换成功"
    };
  } catch (error) {
    logger.error('转换出错:', error);
    return {
      code: 500,
      data: null,
      message: `JSON转Markdown失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 