# 开发指南

## 环境要求

- Node.js >= 14.0.0
- 微信开发者工具 >= 1.06.2307260
- 微信开发者账号

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd FAMILYSCORE-WEXIN
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 填写项目信息：
   - AppID: `wxa67c3712686083db`
   - 项目名称: 家庭积分管理

### 4. 开启云开发

1. 点击开发者工具中的「云开发」按钮
2. 按照指引创建云开发环境
3. 记录环境 ID，后续配置需要用到

### 5. 初始化数据库

在云开发控制台中创建以下集合：

- `family_members` - 家庭成员
- `point_rules` - 积分规则
- `point_records` - 积分记录
- `scratch_cards` - 刮刮卡
- `families` - 家庭信息

### 6. 部署云函数

```bash
# 在微信开发者工具中
# 1. 右键 cloudfunctions/login 选择「创建并部署：云端安装依赖」
# 2. 右键 cloudfunctions/checkUserRole 选择「创建并部署：云端安装依赖」
# 3. 右键 cloudfunctions/createInvite 选择「创建并部署：云端安装依赖」
# 4. 右键 cloudfunctions/joinFamily 选择「创建并部署：云端安装依赖」
# 5. 右键 cloudfunctions/updateScratchCard 选择「创建并部署：云端安装依赖」
```

## 项目结构

```
FAMILYSCORE-WEXIN/
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── pages/                 # 页面目录
│   ├── index/            # 首页
│   ├── members/          # 成员管理
│   ├── rules/            # 规则管理
│   ├── records/          # 记录管理
│   ├── statistics/       # 统计分析
│   ├── scratch/          # 刮刮卡
│   ├── settings/         # 设置
│   └── login/            # 登录
├── components/           # 自定义组件
│   ├── nav-bar/         # 导航栏
│   ├── list-view/       # 列表视图
│   ├── search/          # 搜索组件
│   ├── calendar/        # 日历组件
│   ├── date-range/      # 日期范围选择
│   ├── filter-panel/    # 筛选面板
│   ├── card/            # 卡片组件
│   ├── modal/           # 弹窗组件
│   ├── child-switcher/  # 孩子切换器
│   └── skeleton/        # 骨架屏
├── services/            # 业务服务
│   ├── index.js        # 服务入口
│   ├── rules.js        # 规则服务
│   └── scratch.js      # 刮刮卡服务
├── utils/               # 工具函数
│   ├── date.js         # 日期处理
│   ├── auth.js         # 认证相关
│   └── navigator.js    # 导航工具
├── cloudfunctions/      # 云函数
│   ├── login/          # 登录
│   ├── checkUserRole/  # 角色检查
│   ├── createInvite/   # 创建邀请
│   ├── joinFamily/     # 加入家庭
│   └── updateScratchCard/ # 更新刮刮卡
├── styles/              # 公共样式
│   ├── common.wxss     # 通用样式
│   ├── variables.wxss  # CSS 变量
│   └── iconfont.wxss   # 图标字体
└── docs/                # 文档目录
```

## 开发规范

### 代码风格

- 使用 2 个空格缩进
- 最大行长度 100 字符
- 使用单引号
- 语句末尾使用分号

### 文件命名

- 页面文件: `pages/category/name/*.{js,json,wxml,wxss}`
- 组件文件: `components/name/*.{js,json,wxml,wxss}`
- 使用 kebab-case 命名

### 组件规范

每个组件必须包含以下文件：
- `component-name.js` - 组件逻辑
- `component-name.json` - 组件配置
- `component-name.wxml` - 组件模板
- `component-name.wxss` - 组件样式

### 注释规范

- 函数必须添加 JSDoc 注释
- 复杂逻辑需要添加说明注释
- 组件 props 需要说明类型和用途

## 调试技巧

### 真机调试

1. 点击开发者工具「真机调试」按钮
2. 使用微信扫描二维码
3. 在手机上操作，开发者工具会同步显示调试信息

### 云函数本地调试

```javascript
// 在云函数根目录下创建 test.js
const cloud = require('wx-server-sdk')
cloud.init()

// 本地测试云函数
const main = require('./index').main
main({
  // 测试参数
}).then(res => {
  console.log(res)
})
```

### 常见问题

1. **云函数调用失败**
   - 检查云函数是否已部署
   - 检查环境 ID 配置是否正确

2. **数据库权限错误**
   - 检查集合权限设置
   - 确保用户已登录

3. **样式不生效**
   - 检查选择器优先级
   - 确认样式文件已正确引入

## 提交规范

提交信息格式：

```
<type>: <subject>

<body>

<footer>
```

类型说明：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加家庭成员删除功能

- 添加删除确认弹窗
- 更新成员列表状态
- 添加删除成功提示

Closes #123
```
