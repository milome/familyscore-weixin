# 云函数 API

## 登录相关

### login

用户登录，获取自定义登录态。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录凭证 |

**响应数据：**

```typescript
{
  token: string;      // 登录凭证
  expiresIn: number;  // 过期时间（秒）
  userInfo: {
    openid: string;
    unionid?: string;
    role: 'parent' | 'child';
    familyId: string;
  }
}
```

**示例：**

```javascript
const { result } = await wx.cloud.callFunction({
  name: 'login',
  data: {
    code: 'xxx'
  }
})
```

---

## 权限相关

### checkUserRole

检查用户角色权限。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| requiredRole | string | 是 | 需要的角色 |

**响应数据：**

```typescript
{
  hasPermission: boolean;  // 是否有权限
  currentRole: string;     // 当前角色
}
```

**示例：**

```javascript
const { result } = await wx.cloud.callFunction({
  name: 'checkUserRole',
  data: {
    requiredRole: 'parent'
  }
})
```

---

## 家庭相关

### createInvite

创建家庭邀请码。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| familyId | string | 是 | 家庭 ID |
| role | string | 是 | 邀请角色 |
| expireDays | number | 否 | 过期天数，默认 7 |

**响应数据：**

```typescript
{
  inviteCode: string;   // 邀请码
  expireTime: string;   // 过期时间
  qrCodeUrl: string;    // 二维码图片 URL
}
```

**示例：**

```javascript
const { result } = await wx.cloud.callFunction({
  name: 'createInvite',
  data: {
    familyId: 'xxx',
    role: 'child',
    expireDays: 7
  }
})
```

### joinFamily

加入家庭。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inviteCode | string | 是 | 邀请码 |
| userInfo | object | 是 | 用户信息 |

**响应数据：**

```typescript
{
  familyId: string;     // 家庭 ID
  role: string;         // 分配的角色
  joinedAt: string;     // 加入时间
}
```

**示例：**

```javascript
const { result } = await wx.cloud.callFunction({
  name: 'joinFamily',
  data: {
    inviteCode: 'ABC123',
    userInfo: {
      nickName: '张三',
      avatarUrl: 'xxx'
    }
  }
})
```

---

## 刮刮卡相关

### updateScratchCard

更新刮刮卡状态。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cardId | string | 是 | 刮刮卡 ID |
| action | string | 是 | 操作类型：scratch/reveal/claim |
| data | object | 否 | 附加数据 |

**响应数据：**

```typescript
{
  cardId: string;
  status: string;       // 更新后的状态
  reward?: {
    type: string;
    value: number;
    description: string;
  }
}
```

**示例：**

```javascript
const { result } = await wx.cloud.callFunction({
  name: 'updateScratchCard',
  data: {
    cardId: 'xxx',
    action: 'scratch'
  }
})
```

---

## 通用响应

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

### 错误响应

```json
{
  "code": 1001,
  "message": "参数错误",
  "data": null
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | 权限不足 |
| 1004 | 资源不存在 |
| 1005 | 操作失败 |
| 1006 | 请求过于频繁 |
| 2001 | 登录凭证无效 |
| 2002 | 登录已过期 |
| 3001 | 邀请码无效 |
| 3002 | 邀请码已过期 |
| 3003 | 家庭已满员 |
