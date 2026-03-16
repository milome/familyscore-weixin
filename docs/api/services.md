# 服务层 API

服务层封装了业务逻辑，位于 `services/` 目录。

## 目录

- [规则服务](#规则服务)
- [刮刮卡服务](#刮刮卡服务)

---

## 规则服务

文件路径：`services/rules.js`

### getRules

获取积分规则列表。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| params | object | 否 | 查询参数 |
| params.type | string | 否 | 规则类型：reward/punishment |
| params.page | number | 否 | 页码，默认 1 |
| params.pageSize | number | 否 | 每页数量，默认 20 |

**返回值：**

```typescript
Promise<{
  list: Rule[];
  total: number;
  page: number;
  pageSize: number;
}>
```

**示例：**

```javascript
import { getRules } from '../../services/rules'

const result = await getRules({
  type: 'reward',
  page: 1,
  pageSize: 10
})
```

### getRuleById

根据 ID 获取规则详情。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 规则 ID |

**返回值：**

```typescript
Promise<Rule | null>
```

**示例：**

```javascript
const rule = await getRuleById('rule_xxx')
```

### createRule

创建新规则。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| data | object | 是 | 规则数据 |
| data.name | string | 是 | 规则名称 |
| data.type | string | 是 | 类型：reward/punishment |
| data.points | number | 是 | 积分值 |
| data.description | string | 否 | 规则描述 |
| data.icon | string | 否 | 图标 |

**返回值：**

```typescript
Promise<Rule>
```

**示例：**

```javascript
const newRule = await createRule({
  name: '按时起床',
  type: 'reward',
  points: 10,
  description: '早上 7 点前起床'
})
```

### updateRule

更新规则。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 规则 ID |
| data | object | 是 | 更新的数据 |

**返回值：**

```typescript
Promise<Rule>
```

**示例：**

```javascript
const updatedRule = await updateRule('rule_xxx', {
  points: 15
})
```

### deleteRule

删除规则。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 规则 ID |

**返回值：**

```typescript
Promise<boolean>
```

**示例：**

```javascript
const success = await deleteRule('rule_xxx')
```

---

## 刮刮卡服务

文件路径：`services/scratch.js`

### getScratchCards

获取刮刮卡列表。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| params | object | 否 | 查询参数 |
| params.status | string | 否 | 状态：active/used/expired |
| params.page | number | 否 | 页码 |
| params.pageSize | number | 否 | 每页数量 |

**返回值：**

```typescript
Promise<{
  list: ScratchCard[];
  total: number;
}>
```

**示例：**

```javascript
import { getScratchCards } from '../../services/scratch'

const result = await getScratchCards({
  status: 'active'
})
```

### getScratchCardById

获取刮刮卡详情。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 刮刮卡 ID |

**返回值：**

```typescript
Promise<ScratchCard | null>
```

### createScratchCard

创建刮刮卡。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| data | object | 是 | 刮刮卡数据 |
| data.title | string | 是 | 标题 |
| data.rewards | array | 是 | 奖励配置 |
| data.probability | number | 是 | 中奖概率 |
| data.expireTime | string | 否 | 过期时间 |

**返回值：**

```typescript
Promise<ScratchCard>
```

**示例：**

```javascript
const card = await createScratchCard({
  title: '幸运刮刮卡',
  rewards: [
    { type: 'points', value: 100, description: '100积分' },
    { type: 'points', value: 50, description: '50积分' }
  ],
  probability: 0.5
})
```

### scratchCard

刮开卡片。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 刮刮卡 ID |

**返回值：**

```typescript
Promise<{
  success: boolean;
  reward?: {
    type: string;
    value: number;
    description: string;
  }
}>
```

**示例：**

```javascript
const result = await scratchCard('card_xxx')
if (result.success) {
  console.log('获得奖励:', result.reward)
}
```

### claimReward

领取奖励。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 刮刮卡 ID |

**返回值：**

```typescript
Promise<boolean>
```

---

## 数据类型定义

### Rule

```typescript
interface Rule {
  _id: string;
  name: string;
  type: 'reward' | 'punishment';
  points: number;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  familyId: string;
}
```

### ScratchCard

```typescript
interface ScratchCard {
  _id: string;
  title: string;
  rewards: {
    type: 'points' | 'prize';
    value: number;
    description: string;
    probability: number;
  }[];
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  expireTime?: string;
  createdBy: string;
  familyId: string;
}
```
