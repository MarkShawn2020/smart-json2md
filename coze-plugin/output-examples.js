// 成功输出示例
const successOutput = {
  "code": 200,
  "data": "# documentation\n\n## title\n\nAPI Documentation\n\n## version\n\n1.0.0\n\n## description\n\nComplete API reference for our service\n\n## endpoints\n\n### /users GET\n\n#### description\n\nRetrieve a list of users\n\n#### parameters\n\n1. **name**:\n limit\n1. **type**:\n integer\n1. **required**:\n false\n1. **description**:\n Maximum number of results\n\n1. **name**:\n offset\n1. **type**:\n integer\n1. **required**:\n false\n1. **description**:\n Number of results to skip\n\n#### responses\n\n##### 200\n\n###### description\n\nSuccess\n\n###### contentType\n\napplication/json\n\n##### 400\n\n###### description\n\nBad Request\n\n###### contentType\n\napplication/json\n\n### /users/{id} GET\n\n#### description\n\nRetrieve a single user\n\n#### parameters\n\n1. **name**:\n id\n1. **type**:\n string\n1. **required**:\n true\n1. **description**:\n User ID\n\n#### responses\n\n##### 200\n\n###### description\n\nSuccess\n\n###### contentType\n\napplication/json\n\n##### 404\n\n###### description\n\nUser not found\n\n###### contentType\n\napplication/json",
  "message": "转换成功"
};

// JSON解析错误示例
const parseErrorOutput = {
  "code": 400,
  "data": null,
  "message": "无法解析JSON字符串: Unexpected token in JSON at position 5"
};

// 转换错误示例
const conversionErrorOutput = {
  "code": 500,
  "data": null,
  "message": "JSON转Markdown失败: 转换过程中发生错误"
};

// 导出示例，便于查看和测试
module.exports = {
  successOutput,
  parseErrorOutput,
  conversionErrorOutput
}; 