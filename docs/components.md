# 组件文档

本文档介绍家庭积分管理小程序的自定义组件。

## 目录

- [导航栏 (nav-bar)](#导航栏-nav-bar)
- [列表视图 (list-view)](#列表视图-list-view)
- [搜索组件 (search)](#搜索组件-search)
- [日历组件 (calendar)](#日历组件-calendar)
- [日期范围选择 (date-range)](#日期范围选择-date-range)
- [筛选面板 (filter-panel)](#筛选面板-filter-panel)
- [卡片组件 (card)](#卡片组件-card)
- [弹窗组件 (modal)](#弹窗组件-modal)
- [孩子切换器 (child-switcher)](#孩子切换器-child-switcher)
- [骨架屏 (skeleton)](#骨架屏-skeleton)

---

## 导航栏 (nav-bar)

路径：`/components/nav-bar/nav-bar`

### 功能说明

自定义导航栏组件，支持返回按钮、标题、右侧操作按钮。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 导航栏标题 |
| showBack | boolean | true | 是否显示返回按钮 |
| backgroundColor | string | '#fff' | 背景颜色 |
| color | string | '#000' | 文字颜色 |
| customStyle | string | '' | 自定义样式 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| back | 点击返回按钮时触发 | - |

### 使用示例

```xml
<nav-bar title="成员管理" showBack="{{true}}" bind:back="onBack" />
```

---

## 列表视图 (list-view)

路径：`/components/list-view/list-view`

### 功能说明

通用列表组件，支持下拉刷新、上拉加载、空状态显示。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| list | array | [] | 列表数据 |
| loading | boolean | false | 是否加载中 |
| finished | boolean | false | 是否已加载全部 |
| emptyText | string | '暂无数据' | 空状态提示文字 |
| enableRefresh | boolean | true | 是否启用下拉刷新 |
| enableLoadMore | boolean | true | 是否启用上拉加载 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| refresh | 下拉刷新时触发 | - |
| loadMore | 上拉加载时触发 | - |
| itemClick | 点击列表项时触发 | { item, index } |

### 使用示例

```xml
<list-view
  list="{{memberList}}"
  loading="{{loading}}"
  finished="{{finished}}"
  bind:refresh="onRefresh"
  bind:loadMore="onLoadMore"
  bind:itemClick="onItemClick"
>
  <view slot="item" class="member-item">
    <text>{{item.name}}</text>
  </view>
</list-view>
```

---

## 搜索组件 (search)

路径：`/components/search/search`

### 功能说明

搜索输入框组件，支持搜索历史、热门搜索、实时搜索建议。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| placeholder | string | '请输入搜索关键词' | 占位文字 |
| value | string | '' | 搜索值 |
| showHistory | boolean | true | 是否显示搜索历史 |
| showHot | boolean | false | 是否显示热门搜索 |
| debounce | number | 300 | 防抖延迟（毫秒） |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| search | 确认搜索时触发 | { value } |
| change | 输入变化时触发 | { value } |
| clear | 清空搜索时触发 | - |
| focus | 获得焦点时触发 | - |
| blur | 失去焦点时触发 | - |

### 使用示例

```xml
<search
  placeholder="搜索成员"
  value="{{searchValue}}"
  bind:search="onSearch"
  bind:change="onSearchChange"
/>
```

---

## 日历组件 (calendar)

路径：`/components/calendar/calendar`

### 功能说明

日历选择组件，支持单选、多选、范围选择。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| mode | string | 'single' | 选择模式：single/range/multiple |
| value | string/array | null | 选中日期 |
| minDate | string | null | 最小可选日期 |
| maxDate | string | null | 最大可选日期 |
| showMark | boolean | true | 是否显示标记 |
| marks | array | [] | 标记日期列表 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 选择日期时触发 | { date, value } |
| change | 值变化时触发 | { value } |

### 使用示例

```xml
<calendar
  mode="range"
  value="{{dateRange}}"
  bind:change="onDateChange"
/>
```

---

## 日期范围选择 (date-range)

路径：`/components/date-range/date-range`

### 功能说明

日期范围选择器，快速选择常用日期范围。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| startDate | string | null | 开始日期 |
| endDate | string | null | 结束日期 |
| quickOptions | array | [...] | 快捷选项 |
| format | string | 'YYYY-MM-DD' | 日期格式 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 范围变化时触发 | { startDate, endDate } |
| confirm | 确认选择时触发 | { startDate, endDate } |

### 使用示例

```xml
<date-range
  startDate="{{startDate}}"
  endDate="{{endDate}}"
  bind:change="onRangeChange"
/>
```

---

## 筛选面板 (filter-panel)

路径：`/components/filter-panel/filter-panel`

### 功能说明

筛选条件面板，支持多条件组合筛选。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| filters | array | [] | 筛选条件配置 |
| value | object | {} | 当前筛选值 |
| showReset | boolean | true | 是否显示重置按钮 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 筛选条件变化时触发 | { value } |
| confirm | 确认筛选时触发 | { value } |
| reset | 重置筛选时触发 | - |

### 使用示例

```xml
<filter-panel
  filters="{{filterOptions}}"
  value="{{filterValue}}"
  bind:confirm="onFilterConfirm"
/>
```

---

## 卡片组件 (card)

路径：`/components/card/card`

### 功能说明

通用卡片容器组件，支持标题、内容、操作区域。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 卡片标题 |
| extra | string | '' | 标题右侧内容 |
| shadow | boolean | true | 是否显示阴影 |
| border | boolean | false | 是否显示边框 |
| padding | boolean | true | 是否有内边距 |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| default | 卡片内容 |
| title | 自定义标题 |
| footer | 卡片底部 |

### 使用示例

```xml
<card title="积分统计" extra="查看更多">
  <view class="stats-content">
    <text>今日积分：+50</text>
  </view>
  <view slot="footer" class="card-footer">
    <button size="mini">查看详情</button>
  </view>
</card>
```

---

## 弹窗组件 (modal)

路径：`/components/modal/modal`

### 功能说明

通用弹窗组件，支持确认框、提示框、自定义内容。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | boolean | false | 是否显示 |
| title | string | '' | 弹窗标题 |
| content | string | '' | 弹窗内容 |
| showCancel | boolean | true | 是否显示取消按钮 |
| cancelText | string | '取消' | 取消按钮文字 |
| confirmText | string | '确定' | 确认按钮文字 |
| closeOnClickOverlay | boolean | true | 点击遮罩是否关闭 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| confirm | 点击确认时触发 | - |
| cancel | 点击取消时触发 | - |
| close | 弹窗关闭时触发 | - |

### 使用示例

```xml
<modal
  visible="{{showModal}}"
  title="确认删除"
  content="确定要删除该成员吗？"
  bind:confirm="onConfirmDelete"
  bind:cancel="onCancelDelete"
/>
```

---

## 孩子切换器 (child-switcher)

路径：`/components/child-switcher/child-switcher`

### 功能说明

快速切换当前选中的孩子，用于家长视角操作。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | array | [] | 孩子列表 |
| currentId | string | null | 当前选中孩子 ID |
| showAvatar | boolean | true | 是否显示头像 |

### 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 切换孩子时触发 | { child, index } |

### 使用示例

```xml
<child-switcher
  children="{{childrenList}}"
  currentId="{{currentChildId}}"
  bind:change="onChildChange"
/>
```

---

## 骨架屏 (skeleton)

路径：`/components/skeleton/skeleton`

### 功能说明

加载占位骨架屏，提升用户体验。

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| loading | boolean | true | 是否显示骨架屏 |
| rows | number | 3 | 行数 |
| avatar | boolean | false | 是否显示头像占位 |
| title | boolean | true | 是否显示标题占位 |
| animated | boolean | true | 是否开启动画 |

### 使用示例

```xml
<skeleton loading="{{loading}}" rows="5" avatar="{{true}}">
  <view class="content">
    <!-- 实际内容 -->
  </view>
</skeleton>
```

---

## 组件开发规范

### 文件结构

```
component-name/
├── component-name.js      # 组件逻辑
├── component-name.json    # 组件配置
├── component-name.wxml    # 组件模板
├── component-name.wxss    # 组件样式
└── README.md             # 组件说明（可选）
```

### 命名规范

- 组件名使用 kebab-case（短横线连接）
- 属性名使用 camelCase
- 事件名使用小写，多个单词用连字符分隔

### 样式规范

- 使用 BEM 命名规范
- 组件根元素添加组件名作为 class
- 避免使用全局样式

```css
/* 推荐 */
.nav-bar { }
.nav-bar__title { }
.nav-bar__back-btn { }

/* 不推荐 */
.title { }
.back { }
```

### 事件规范

- 自定义事件使用 `bind:` 或 `catch:` 前缀
- 事件名简洁明了
- 事件对象包含必要的数据

```javascript
// 触发事件
this.triggerEvent('change', {
  value: this.data.value,
  index: this.data.index
})
```
