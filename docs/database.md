# 数据库设计

本文档描述家庭积分管理小程序的数据库设计。

## 概述

使用微信云开发的数据库，基于 MongoDB 的文档型数据库。

## 数据集合

### 1. families（家庭）

存储家庭基本信息。

```javascript
{
  _id: string,           // 家庭 ID，自动生成
  name: string,          // 家庭名称
  creatorId: string,     // 创建者 openid
  createdAt: Date,       // 创建时间
  updatedAt: Date,       // 更新时间
  memberCount: number,   // 成员数量
  maxMembers: number,    // 最大成员数，默认 10
  inviteCode: string,    // 当前邀请码
  inviteExpireAt: Date   // 邀请码过期时间
}
```

**索引：**
- `_id` (默认)
- `inviteCode` (唯一)

**权限：**
- 读取：仅创建者可读
- 写入：仅创建者可写

---

### 2. family_members（家庭成员）

存储家庭成员信息。

```javascript
{
  _id: string,           // 成员 ID
  familyId: string,      // 所属家庭 ID
  openid: string,        // 微信用户 openid
  role: string,          // 角色：parent/child
  name: string,          // 成员姓名
  avatar: string,        // 头像 URL
  gender: string,        // 性别：male/female
  points: number,        // 当前积分
  totalEarned: number,   // 累计获得积分
  totalSpent: number,    // 累计消费积分
  isActive: boolean,     // 是否激活
  joinedAt: Date,        // 加入时间
  updatedAt: Date        // 更新时间
}
```

**索引：**
- `_id` (默认)
- `familyId`
- `openid` (唯一)
- `role`

**权限：**
- 读取：所有用户可读
- 写入：仅创建者可写

---

### 3. point_rules（积分规则）

存储积分规则定义。

```javascript
{
  _id: string,           // 规则 ID
  familyId: string,      // 所属家庭 ID
  name: string,          // 规则名称
  type: string,          // 类型：reward(奖励)/punishment(惩罚)
  points: number,        // 积分值（正数）
  description: string,   // 规则描述
  icon: string,          // 图标名称
  color: string,         // 颜色标识
  isActive: boolean,     // 是否启用
  order: number,         // 排序
  createdAt: Date,       // 创建时间
  updatedAt: Date,       // 更新时间
  createdBy: string      // 创建者 openid
}
```

**索引：**
- `_id` (默认)
- `familyId`
- `type`
- `isActive`

**权限：**
- 读取：所有用户可读
- 写入：仅创建者可写

---

### 4. point_records（积分记录）

存储积分变动记录。

```javascript
{
  _id: string,           // 记录 ID
  familyId: string,      // 所属家庭 ID
  memberId: string,      // 成员 ID
  ruleId: string,        // 规则 ID（可选）
  type: string,          // 类型：reward/punishment/adjust
  points: number,        // 变动积分（正数奖励，负数惩罚）
  balance: number,       // 变动后余额
  description: string,   // 描述/备注
  images: string[],      // 图片证据
  createdAt: Date,       // 创建时间
  createdBy: string,     // 操作者 openid
  isConfirmed: boolean,  // 是否已确认
  confirmedAt: Date      // 确认时间
}
```

**索引：**
- `_id` (默认)
- `familyId`
- `memberId`
- `ruleId`
- `createdAt`
- `type`

**权限：**
- 读取：所有用户可读
- 写入：仅创建者可写

---

### 5. scratch_cards（刮刮卡）

存储刮刮卡信息。

```javascript
{
  _id: string,           // 卡片 ID
  familyId: string,      // 所属家庭 ID
  title: string,         // 卡片标题
  description: string,   // 卡片描述
  rewards: [{            // 奖励配置
    type: string,        // 类型：points/prize
    value: number,       // 数值
    description: string, // 描述
    probability: number  // 中奖概率 0-1
  }],
  totalCount: number,    // 总数量
  usedCount: number,     // 已使用数量
  status: string,        // 状态：active/paused/expired
  startTime: Date,       // 开始时间
  endTime: Date,         // 结束时间
  createdAt: Date,       // 创建时间
  createdBy: string      // 创建者 openid
}
```

**索引：**
- `_id` (默认)
- `familyId`
- `status`
- `endTime`

**权限：**
- 读取：所有用户可读
- 写入：仅创建者可写

---

### 6. scratch_records（刮刮记录）

存储用户刮卡记录。

```javascript
{
  _id: string,           // 记录 ID
  cardId: string,        // 刮刮卡 ID
  memberId: string,      // 成员 ID
  familyId: string,      // 家庭 ID
  reward: {              // 获得的奖励
    type: string,
    value: number,
    description: string
  },
  scratchedAt: Date,     // 刮开时间
  claimedAt: Date,       // 领取时间
  status: string         // 状态：scratched/claimed/expired
}
```

**索引：**
- `_id` (默认)
- `cardId`
- `memberId`
- `familyId`

**权限：**
- 读取：所有用户可读
- 写入：仅创建者可写

---

### 7. invite_codes（邀请码）

存储邀请码信息。

```javascript
{
  _id: string,           // 邀请码
  familyId: string,      // 家庭 ID
  role: string,          // 邀请角色
  maxUses: number,       // 最大使用次数
  usedCount: number,     // 已使用次数
  expireAt: Date,        // 过期时间
  createdAt: Date,       // 创建时间
  createdBy: string      // 创建者 openid
}
```

**索引：**
- `_id` (默认)
- `familyId`
- `expireAt`

**权限：**
- 读取：所有用户可读
- 写入：仅创建者可写

---

## 关联关系

```
families (1) --<n>-- family_members
           (1) --<n>-- point_rules
           (1) --<n>-- point_records
           (1) --<n>-- scratch_cards
           (1) --<n>-- invite_codes

family_members (1) --<n>-- point_records
               (1) --<n>-- scratch_records

point_rules (1) --<n>-- point_records

scratch_cards (1) --<n>-- scratch_records
```

## 数据库初始化脚本

```javascript
// 在云函数中初始化数据库
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async () => {
  // 创建集合
  const collections = [
    'families',
    'family_members',
    'point_rules',
    'point_records',
    'scratch_cards',
    'scratch_records',
    'invite_codes'
  ]

  for (const name of collections) {
    try {
      await db.createCollection(name)
      console.log(`集合 ${name} 创建成功`)
    } catch (error) {
      console.log(`集合 ${name} 已存在或创建失败:`, error)
    }
  }

  return { success: true }
}
```

## 数据迁移

### 导出数据

```javascript
// 导出指定集合数据
const exportCollection = async (collectionName) => {
  const db = cloud.database()
  const collection = db.collection(collectionName)

  const { data } = await collection.get()

  // 保存到云存储
  const fileContent = JSON.stringify(data, null, 2)
  const cloudPath = `backups/${collectionName}_${Date.now()}.json`

  await cloud.uploadFile({
    cloudPath,
    fileContent: Buffer.from(fileContent)
  })

  return cloudPath
}
```

### 导入数据

```javascript
// 导入数据到指定集合
const importCollection = async (collectionName, data) => {
  const db = cloud.database()
  const collection = db.collection(collectionName)

  // 批量添加
  const batch = []
  for (const item of data) {
    batch.push(collection.add({ data: item }))
    if (batch.length >= 100) {
      await Promise.all(batch)
      batch.length = 0
    }
  }

  if (batch.length > 0) {
    await Promise.all(batch)
  }

  return { success: true, count: data.length }
}
```

## 性能优化建议

1. **索引优化**
   - 为常用查询字段创建索引
   - 避免过多索引影响写入性能

2. **分页查询**
   - 使用 skip + limit 进行分页
   - 大数据量时使用最后一条数据的 _id 作为游标

3. **数据清理**
   - 定期清理过期数据
   - 归档历史记录

4. **批量操作**
   - 使用批量写入减少请求次数
   - 单次批量操作不超过 100 条
