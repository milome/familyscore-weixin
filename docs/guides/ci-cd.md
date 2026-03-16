# CI/CD 配置指南

本文档介绍项目的持续集成和持续部署 (CI/CD) 配置。

## 概述

项目使用 GitHub Actions 作为 CI/CD 平台，自动化以下流程：

- **CI (持续集成)**: 代码检查、验证、测试
- **CD (持续部署)**: 自动部署、发布管理
- **代码质量**: 安全审计、重复代码检测

## 工作流

### 1. CI 工作流 (`.github/workflows/ci.yml`)

**触发条件:**
- Push 到 master、main、develop 分支
- Pull Request 到 master、main 分支

**任务:**

#### Lint 任务
- 安装依赖
- 运行 ESLint 代码检查
- 检查文件命名规范

#### Validate 任务
- 验证 JSON 文件格式
- 验证微信小程序配置
- 检查项目结构完整性

### 2. CD 工作流 (`.github/workflows/cd.yml`)

**触发条件:**
- Push 到 master、main 分支
- 推送版本标签 (v*)

**任务:**

#### Deploy Cloud Functions
- 安装微信开发者工具 CLI
- 准备云函数部署
- 上传到微信小程序平台（需要配置密钥）

#### Create Release
- 创建 GitHub Release
- 生成发布说明

### 3. Code Quality 工作流 (`.github/workflows/code-quality.yml`)

**触发条件:**
- Push 到 master、main、develop 分支
- Pull Request 到 master、main 分支
- 每周定时运行（周一早上 9 点）

**任务:**

#### Security Audit
- 运行 npm audit 检查依赖安全
- 使用 TruffleHog 扫描代码中的敏感信息

#### Duplicate Code Detection
- 检测重复代码
- 报告潜在的文件重复

#### Documentation Check
- 检查文档文件完整性
- 检查 TODO/FIXME 注释

## 配置 Secrets

要在 CI/CD 中使用敏感信息，需要在 GitHub 仓库中配置 Secrets：

### 配置步骤

1. 访问仓库设置：`Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 添加以下 Secrets：

#### 必需的 Secrets

| Secret Name | 说明 | 获取方式 |
|------------|------|---------|
| `WECHAT_APPID` | 微信小程序 AppID | 微信公众平台 → 开发 → 开发设置 |
| `WECHAT_PRIVATE_KEY` | 微信小程序上传密钥 | 微信公众平台 → 开发 → 开发设置 → 小程序代码上传 |

#### 可选的 Secrets

| Secret Name | 说明 |
|------------|------|
| `GITHUB_TOKEN` | 自动提供，无需手动配置 |

### 获取微信小程序上传密钥

1. 登录[微信公众平台](https://mp.weixin.qq.com)
2. 进入「开发」→「开发设置」
3. 找到「小程序代码上传」
4. 生成并下载上传密钥文件
5. 将密钥内容添加到 GitHub Secrets

## 本地测试 CI

### 使用 act 工具本地运行

```bash
# 安装 act
brew install act

# 运行 CI 工作流
act push

# 运行特定工作流
act push -W .github/workflows/ci.yml

# 运行特定任务
act push -j lint
```

### 手动验证

```bash
# 验证 JSON 文件
find . -name "*.json" -not -path "./node_modules/*" | xargs -I {} sh -c 'jq empty {} || echo "Invalid: {}"'

# 检查文件命名
find . -name "*.js" | grep -E "[A-Z]" | grep -v node_modules

# 检查 TODO 注释
grep -r "TODO\|FIXME" --include="*.js" . | grep -v node_modules
```

## 工作流状态

### 查看状态

- 访问仓库主页查看徽章状态
- 点击徽章查看详细日志
- 在 `Actions` 标签页查看所有运行记录

### 常见状态

| 状态 | 说明 |
|------|------|
| ✅ Passing | 所有检查通过 |
| ❌ Failing | 有检查失败，需要修复 |
| 🟡 Pending | 正在运行中 |
| ⚪ Skipped | 被跳过（如条件不满足）|

## 故障排除

### CI 失败常见原因

1. **JSON 格式错误**
   ```bash
   # 检查并修复 JSON
   jq . config.json > config.json.tmp && mv config.json.tmp config.json
   ```

2. **缺少必需文件**
   - 确保 `app.json`、`app.js` 等核心文件存在

3. **Secrets 未配置**
   - 检查仓库 Settings 中的 Secrets 配置

4. **权限问题**
   - 确保 GitHub Actions 有仓库写入权限

### 调试 CI

1. **启用调试日志**
   在 GitHub Actions 页面点击 `Re-run jobs` → `Enable debug logging`

2. **添加调试步骤**
   ```yaml
   - name: Debug
     run: |
       echo "Current directory: $(pwd)"
       ls -la
       env
   ```

3. **本地复现**
   ```bash
   # 使用相同的容器环境
   act -P ubuntu-latest=nektos/act-environments-ubuntu:18.04
   ```

## 最佳实践

### 提交前检查清单

- [ ] 所有 JSON 文件格式正确
- [ ] 没有遗留的 TODO/FIXME 注释
- [ ] 代码符合项目规范
- [ ] 文档已更新

### 分支保护规则

建议在 GitHub 中配置分支保护：

1. 进入 `Settings` → `Branches`
2. 添加规则：`master` 和 `main`
3. 启用：
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### 版本发布流程

1. 更新版本号（`project.config.json`）
2. 更新 `CHANGELOG.md`
3. 创建 Git 标签：
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
4. GitHub Actions 自动创建 Release

## 参考

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [微信小程序 CI 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)
- [TruffleHog 文档](https://github.com/trufflesecurity/trufflehog)
