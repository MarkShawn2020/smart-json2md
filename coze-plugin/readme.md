# JSON to Markdown Converter Coze Plugin

此插件使用 smart-json2md 将JSON数据转换为层次化的Markdown文档。

## 功能特点

- 自动将JSON对象转换为基于层次结构的Markdown标题
- 支持嵌套对象和适当的标题级别
- 通过配置处理深层结构（超过标题级别限制时自动转为列表）
- 智能处理具有共同结构的对象数组
- 可配置的最小和最大标题级别
- 可选择使用有序或无序列表显示深层结构
- 可选择包含值的类型信息
- 统一的输出格式，包含状态码、数据和消息

## 安装

在Coze平台添加此插件，并确保添加以下环境依赖：

```
smart-json2md
```

## 使用方法

调用此插件并传入JSON数据（序列化为字符串）及转换选项。

## 输出格式

插件统一采用以下结构返回结果：

```json
{
  "code": 200,       // 状态码：200成功，400解析错误，500转换错误
  "data": "...",     // 转换后的Markdown（失败时为null）
  "message": "..."   // 结果消息（成功或出错提示）
}
```

## 示例

输入:
```json
{
  "jsonData": "{\"blog\":{\"title\":\"My Blog\",\"posts\":[{\"title\":\"First Post\",\"content\":\"Hello World\"}]}}",
  "options": {
    "minHeadingLevel": 2,
    "maxHeadingLevel": 4
  }
}
```

输出:
```json
{
  "code": 200,
  "data": "## blog\n\n### title\n\nMy Blog\n\n### posts\n\n#### First Post\n\n##### content\n\nHello World",
  "message": "转换成功"
}
```

## 错误处理

当发生错误时，插件会返回相应的错误代码和消息：

```json
{
  "code": 400,
  "data": null,
  "message": "无法解析JSON字符串: Unexpected token 'x' at position 5"
}
```

或

```json
{
  "code": 500,
  "data": null,
  "message": "JSON转Markdown失败: 转换过程中发生错误"
}
```

## 注意事项

- jsonData 必须是序列化后的 JSON 字符串，不是 JSON 对象
- 所有选项参数都是可选的，如果不提供，将使用默认值
