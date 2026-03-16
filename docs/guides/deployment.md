# 部署指南

## 发布流程

### 1. 代码检查

在提交审核前，请确保：

- [ ] 代码已通过 ESLint 检查
- [ ] 所有功能在真机上测试通过
- [ ] 云函数已部署到生产环境
- [ ] 数据库权限配置正确
- [ ] 敏感信息已移除（如调试日志、测试数据）

### 2. 版本号管理

在 `project.config.json` 中更新版本号：

```json
{
  "version": "1.0.0"
}
```

版本号格式：主版本号.次版本号.修订号

### 3. 上传代码

1. 在微信开发者工具中点击「上传」
2. 填写版本号和项目备注
3. 等待上传完成

### 4. 提交审核

1. 登录[微信公众平台](https://mp.weixin.qq.com)
2. 进入「版本管理」
3. 找到开发版本，点击「提交审核」
4. 填写审核信息：
   - 功能介绍
   - 测试账号（如有需要）
   - 备注说明

### 5. 审核通过后发布

审核通过后，在「版本管理」中点击「发布」即可上线。

## 环境配置

### 开发环境

```javascript
// app.js
wx.cloud.init({
  env: 'dev-environment-id',
  traceUser: true
})
```

### 生产环境

```javascript
// app.js
wx.cloud.init({
  env: 'prod-environment-id',
  traceUser: true
})
```

## 云函数部署

### 单个部署

在微信开发者工具中：
1. 右键点击云函数目录
2. 选择「创建并部署：云端安装依赖」

### 批量部署

```bash
# 使用微信开发者命令行工具
cli cloud functions deploy --e prod-environment-id --n login
cli cloud functions deploy --e prod-environment-id --n checkUserRole
cli cloud functions deploy --e prod-environment-id --n createInvite
cli cloud functions deploy --e prod-environment-id --n joinFamily
cli cloud functions deploy --e prod-environment-id --n updateScratchCard
```

## 数据库迁移

### 导出数据

```javascript
// 使用云函数导出
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async () => {
  const db = cloud.database()
  const collections = ['family_members', 'point_rules', 'point_records']

  for (const name of collections) {
    const { data } = await db.collection(name).get()
    // 保存到云存储
    await cloud.uploadFile({
      cloudPath: `backup/${name}_${Date.now()}.json`,
      fileContent: JSON.stringify(data)
    })
  }
}
```

### 导入数据

```javascript
// 使用云函数导入
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event) => {
  const db = cloud.database()
  const { collection, data } = event

  for (const item of data) {
    await db.collection(collection).add({
      data: item
    })
  }
}
```

## 性能优化

### 代码包大小优化

1. 启用代码压缩
   ```json
   // project.config.json
   {
     "setting": {
       "minified": true
     }
   }
   ```

2. 分包加载
   ```json
   // app.json
   {
     "subpackages": [
       {
         "root": "packages/members",
         "pages": [
           "pages/list/index",
           "pages/edit/index"
         ]
       }
     ]
   }
   ```

### 图片资源优化

1. 使用 CDN 加速
2. 压缩图片大小
3. 使用 WebP 格式（如支持）

### 云函数优化

1. 合理设置超时时间
2. 使用连接池
3. 添加缓存机制

## 监控与日志

### 查看日志

1. 微信开发者工具「云开发」→「日志」
2. 按时间、函数名筛选
3. 查看错误日志和调用记录

### 性能监控

1. 使用「小程序助手」查看性能数据
2. 关注启动时间、页面切换时间
3. 监控 JS 错误率

## 回滚方案

如发布后出现严重问题：

1. 立即在「版本管理」中「回退」到上一个版本
2. 修复问题后重新提交审核
3. 紧急情况下可联系微信客服加速审核

## 安全注意事项

1. **敏感信息**
   - 不要在代码中硬编码密钥
   - 使用云函数处理敏感操作
   - 数据库权限设置为仅创建者可读写

2. **用户数据**
   - 遵守《微信小程序平台运营规范》
   - 获取用户授权后再收集信息
   - 提供数据删除功能

3. **内容安全**
   - 对用户输入进行过滤
   - 使用微信内容安全接口审核内容
   - 建立举报机制
