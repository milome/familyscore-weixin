# API 文档

本文档介绍家庭积分管理小程序的接口规范，包括云函数 API 和服务层 API。

## 目录

- [云函数 API](./cloud-functions.md)
- [服务层 API](./services.md)
- [数据库 API](./database.md)
- [错误码说明](./error-codes.md)

## 接口规范

### 请求格式

云函数调用统一格式：

```javascript
wx.cloud.callFunction({
  name: 'functionName',
  data: {
    // 请求参数
  }
})
```

### 响应格式

统一响应结构：

```typescript
interface ApiResponse<T> {
  code: number;      // 状态码，0 表示成功
  message: string;   // 提示信息
  data: T;          // 响应数据
}
```

### 错误处理

```javascript
try {
  const { result } = await wx.cloud.callFunction({
    name: 'functionName',
    data: params
  })

  if (result.code !== 0) {
    throw new Error(result.message)
  }

  return result.data
} catch (error) {
  console.error('API 调用失败:', error)
  throw error
}
```

## 认证机制

所有 API 调用需要用户登录态，通过 `wx.login()` 获取 code，调用 `login` 云函数换取自定义登录态。

### 登录流程

```javascript
// 1. 获取微信登录凭证
const { code } = await wx.login()

// 2. 调用登录云函数
const { result } = await wx.cloud.callFunction({
  name: 'login',
  data: { code }
})

// 3. 保存登录态
wx.setStorageSync('token', result.data.token)
```

## 权限控制

基于角色的权限控制：

- `parent` - 家长：拥有全部权限
- `child` - 孩子：拥有受限权限

权限检查：

```javascript
const { result } = await wx.cloud.callFunction({
  name: 'checkUserRole',
  data: { requiredRole: 'parent' }
})
```

## 分页规范

列表接口支持分页：

```javascript
{
  page: 1,        // 当前页码，从 1 开始
  pageSize: 20,   // 每页数量
  total: 100      // 总记录数
}
```

## 数据格式

### 日期时间

统一使用 ISO 8601 格式：

```javascript
// 示例
const dateTime = '2024-01-15T10:30:00.000Z'
```

### 金额/积分

以整数存储，单位：分/积分

```javascript
// 示例：100 表示 100 积分
const points = 100
```

## 版本控制

API 版本通过云函数名称管理：

- `login` - 当前版本
- `login_v2` - v2 版本（如有重大变更）

## 限流策略

- 单个用户：100 次/分钟
- 单个 IP：1000 次/分钟

超过限流将返回错误码 `429`。
