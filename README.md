# 家庭积分管理小程序

[![CI](https://github.com/milome/familyscore-weixin/actions/workflows/ci.yml/badge.svg)](https://github.com/milome/familyscore-weixin/actions/workflows/ci.yml)
[![Code Quality](https://github.com/milome/familyscore-weixin/actions/workflows/code-quality.yml/badge.svg)](https://github.com/milome/familyscore-weixin/actions/workflows/code-quality.yml)
[![CD](https://github.com/milome/familyscore-weixin/actions/workflows/cd.yml/badge.svg)](https://github.com/milome/familyscore-weixin/actions/workflows/cd.yml)

一个用于管理家庭成员积分的微信小程序。

## 功能特性

- 成员管理（家长、孩子）
- 积分规则管理
- 积分记录管理
- 统计分析
- 基于角色的权限控制

## 技术栈

- 微信小程序原生开发
- 微信云开发
  - 云数据库
  - 云函数
  - 云存储

## 开发环境

- Node.js
- 微信开发者工具

## 项目结构

- /pages - 页面文件
- /components - 自定义组件
- /services - 业务服务
- /utils - 工具函数
- /cloudfunctions - 云函数

## 开始使用

1. 克隆项目
2. 安装依赖
3. 在微信开发者工具中导入项目
4. 开启云开发
5. 创建必要的数据库集合

## 数据模型

### 成员表 (family_members)
- 姓名
- 角色（爸爸/妈妈/孩子）
- 性别
- 家庭关系
- 积分

### 规则表 (point_rules)
- 规则名称
- 类型（奖励/惩罚）
- 分值

### 记录表 (point_records)
- 成员ID
- 规则ID
- 分值
- 类型
- 时间 