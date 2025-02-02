const app = getApp()

Page({
  data: {
    result: '',
    testResults: []
  },

  onLoad() {
    this.runTests()
  },

  async runTests() {
    const tests = [
      this.testAddRule,
      this.testGetRules,
      this.testUpdateRule,
      this.testDeleteRule,
      this.testAddMember,
      this.testGetMembers
    ]

    const results = []
    for (const test of tests) {
      try {
        await test.call(this)
        results.push({
          name: test.name,
          status: 'success',
          message: '测试通过'
        })
      } catch (err) {
        results.push({
          name: test.name,
          status: 'fail',
          message: err.message
        })
      }
    }

    this.setData({ testResults: results })
  },

  async testAddRule() {
    const { addRule } = require('../../services/rules')
    const testRule = {
      name: '测试规则-' + Date.now(),
      type: 'reward',
      points: 10
    }
    const result = await addRule(testRule)
    if (!result._id) throw new Error('添加规则失败')
    this.testRuleId = result._id
  },

  async testGetRules() {
    const { getRuleList } = require('../../services/rules')
    const rules = await getRuleList()
    if (!Array.isArray(rules)) throw new Error('获取规则列表失败')
  },

  async testUpdateRule() {
    if (!this.testRuleId) throw new Error('没有可更新的规则')
    const { updateRule } = require('../../services/rules')
    await updateRule(this.testRuleId, {
      name: '更新的规则-' + Date.now()
    })
  },

  async testDeleteRule() {
    if (!this.testRuleId) throw new Error('没有可删除的规则')
    const { deleteRule } = require('../../services/rules')
    await deleteRule(this.testRuleId)
  },

  async testAddMember() {
    const { addMember } = require('../../services/members')
    const testMember = {
      name: '测试成员-' + Date.now(),
      avatar: '/images/default-avatar.png'
    }
    const result = await addMember(testMember)
    if (!result._id) throw new Error('添加成员失败')
    this.testMemberId = result._id
  },

  async testGetMembers() {
    const { getMemberList } = require('../../services/members')
    const members = await getMemberList()
    if (!Array.isArray(members)) throw new Error('获取成员列表失败')
  },

  // 测试添加成员
  testAddMember() {
    const db = wx.cloud.database()
    db.collection('family_members').add({
      data: {
        name: '测试成员',
        points: 0,
        openid: app.globalData.userInfo?.openid || 'test_openid',
        avatar: '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    }).then(res => {
      this.setData({
        result: '成员添加成功：' + JSON.stringify(res)
      })
    }).catch(err => {
      this.setData({
        result: '成员添加失败：' + JSON.stringify(err)
      })
    })
  },

  // 测试添加规则
  testAddRule() {
    const db = wx.cloud.database()
    db.collection('point_rules').add({
      data: {
        title: '测试规则',
        points: 10,
        description: '这是一条测试规则',
        _openid: app.globalData.userInfo?.openid || 'test_openid',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false,
        type: 'reward',
        status: 'active'
      }
    }).then(res => {
      this.setData({
        result: '规则添加成功：' + JSON.stringify(res)
      })
    }).catch(err => {
      this.setData({
        result: '规则添加失败：' + JSON.stringify(err)
      })
    })
  },

  // 测试添加记录
  testAddRecord() {
    const db = wx.cloud.database()
    // 先获取一个成员和一个规则
    Promise.all([
      db.collection('family_members').limit(1).get(),
      db.collection('point_rules').limit(1).get()
    ]).then(([memberRes, ruleRes]) => {
      const member = memberRes.data[0]
      const rule = ruleRes.data[0]
      if (!member || !rule) {
        throw new Error('请先添加成员和规则')
      }

      // 打印获取到的成员和规则信息
      console.log('获取到的成员:', member)
      console.log('获取到的规则:', rule)

      const recordData = {
        memberId: member._id,
        memberName: member.name,
        memberAvatar: member.avatar || '',
        ruleId: rule._id,
        ruleTitle: rule.title,
        points: rule.points,
        _openid: app.globalData.userInfo?.openid || 'test_openid',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false,
        status: 'active',
        description: '测试积分记录',
        type: rule.type || 'reward',
        operatorId: app.globalData.userInfo?.openid || 'test_openid',
        operatorName: '测试操作员',
        remark: '测试添加积分记录',
        memberPoints: member.points || 0,  // 添加成员当前积分
        ruleType: rule.type || 'reward',   // 添加规则类型
        operateTime: db.serverDate()       // 添加操作时间
      }

      // 打印准备添加的记录数据
      console.log('准备添加的记录:', recordData)

      return db.collection('point_records').add({
        data: recordData
      })
    }).then(res => {
      this.setData({
        result: '记录添加成功：' + JSON.stringify(res)
      })
    }).catch(err => {
      this.setData({
        result: '记录添加失败：' + JSON.stringify(err)
      })
    })
  },

  testLogin() {
    console.log('开始调用云函数 login')  // 更详细的日志
    wx.cloud.callFunction({
      name: 'login',
      success: (res) => {
        console.log('云函数调用成功', res.result)  // 打印返回结果
        console.log('完整返回数据', res)  // 打印完整数据
        this.setData({
          result: JSON.stringify(res.result, null, 2)
        })
      },
      fail: (err) => {
        console.error('云函数调用失败', err)  // 保持错误日志
        wx.showToast({  // 添加错误提示
          title: '调用失败',
          icon: 'none'
        })
        this.setData({
          result: '调用失败：' + JSON.stringify(err)
        })
      },
      complete: () => {
        console.log('云函数调用完成')  // 添加完成日志
      }
    })
  },

  // 清理测试数据
  clearTestData() {
    const db = wx.cloud.database()
    const _ = db.command
    
    // 清理所有测试数据
    Promise.all([
      // 清理积分记录
      db.collection('point_records')
        .where({
          _openid: app.globalData.userInfo?.openid || 'test_openid'
        })
        .remove(),
        
      // 清理成员
      db.collection('family_members')
        .where({
          openid: 'test_openid'
        })
        .remove(),
        
      // 清理规则
      db.collection('point_rules')
        .where({
          _openid: app.globalData.userInfo?.openid || 'test_openid'
        })
        .remove()
    ])
    .then(([recordRes, memberRes, ruleRes]) => {
      this.setData({
        result: '清理完成：\n' + 
          `删除记录：${recordRes.stats.removed}条\n` +
          `删除成员：${memberRes.stats.removed}条\n` +
          `删除规则：${ruleRes.stats.removed}条`
      })
    })
    .catch(err => {
      this.setData({
        result: '清理失败：' + JSON.stringify(err)
      })
    })
  },

  // 测试修改成员
  testUpdateMember() {
    const db = wx.cloud.database()
    // 先查询一个成员
    db.collection('family_members')
      .limit(1)
      .get()
      .then(res => {
        const member = res.data[0]
        if (!member) {
          throw new Error('没有找到成员')
        }
        // 更新成员信息
        return db.collection('family_members').doc(member._id).update({
          data: {
            name: '更新后的成员',
            points: member.points + 10,
            updateTime: db.serverDate()
          }
        })
      })
      .then(res => {
        this.setData({
          result: '成员更新成功：' + JSON.stringify(res)
        })
      })
      .catch(err => {
        this.setData({
          result: '成员更新失败：' + JSON.stringify(err)
        })
      })
  },

  // 测试查询成员
  testQueryMembers() {
    const db = wx.cloud.database()
    db.collection('family_members')
      .where({
        isDeleted: false
      })
      .get()
      .then(res => {
        this.setData({
          result: '成员查询成功：' + JSON.stringify(res.data, null, 2)
        })
      })
      .catch(err => {
        this.setData({
          result: '成员查询失败：' + JSON.stringify(err)
        })
      })
  },

  // 测试修改规则
  testUpdateRule() {
    const db = wx.cloud.database()
    // 先查询一个规则
    db.collection('point_rules')
      .limit(1)
      .get()
      .then(res => {
        const rule = res.data[0]
        if (!rule) {
          throw new Error('没有找到规则')
        }
        // 更新规则信息
        return db.collection('point_rules').doc(rule._id).update({
          data: {
            title: '更新后的规则',
            points: rule.points + 5,
            description: '这是更新后的规则描述',
            updateTime: db.serverDate()
          }
        })
      })
      .then(res => {
        this.setData({
          result: '规则更新成功：' + JSON.stringify(res)
        })
      })
      .catch(err => {
        this.setData({
          result: '规则更新失败：' + JSON.stringify(err)
        })
      })
  },

  // 测试查询规则
  testQueryRules() {
    const db = wx.cloud.database()
    db.collection('point_rules')
      .where({
        isDeleted: false,
        status: 'active'
      })
      .get()
      .then(res => {
        this.setData({
          result: '规则查询成功：' + JSON.stringify(res.data, null, 2)
        })
      })
      .catch(err => {
        this.setData({
          result: '规则查询失败：' + JSON.stringify(err)
        })
      })
  },

  // 测试查询记录
  testQueryRecords() {
    const db = wx.cloud.database()
    db.collection('point_records')
      .where({
        isDeleted: false
      })
      .orderBy('createTime', 'desc')
      .limit(10)
      .get()
      .then(res => {
        this.setData({
          result: '记录查询成功：' + JSON.stringify(res.data, null, 2)
        })
      })
      .catch(err => {
        this.setData({
          result: '记录查询失败：' + JSON.stringify(err)
        })
      })
  },

  // 测试查询成员积分
  testMemberPoints() {
    const db = wx.cloud.database()
    db.collection('family_members')
      .field({
        _id: true,
        name: true,
        points: true
      })
      .where({
        isDeleted: false
      })
      .get()
      .then(res => {
        this.setData({
          result: '成员积分查询成功：' + JSON.stringify(res.data, null, 2)
        })
      })
      .catch(err => {
        this.setData({
          result: '成员积分查询失败：' + JSON.stringify(err)
        })
      })
  },

  // 批量添加测试数据
  testBatchAdd() {
    const db = wx.cloud.database()
    
    // 1. 批量添加成员
    const members = [
      {
        name: '测试成员1',
        points: 100,
        openid: 'test_openid',
        avatar: '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      },
      {
        name: '测试成员2',
        points: 200,
        openid: 'test_openid',
        avatar: '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    ]

    // 2. 批量添加规则
    const rules = [
      {
        title: '测试规则1',
        points: 10,
        description: '这是测试规则1',
        _openid: 'test_openid',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false,
        type: 'reward',
        status: 'active'
      },
      {
        title: '测试规则2',
        points: -5,
        description: '这是测试规则2',
        _openid: 'test_openid',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false,
        type: 'penalty',
        status: 'active'
      }
    ]

    // 3. 执行批量添加
    Promise.all([
      // 添加成员
      ...members.map(member => 
        db.collection('family_members').add({ data: member })
      ),
      // 添加规则
      ...rules.map(rule => 
        db.collection('point_rules').add({ data: rule })
      )
    ])
    .then(results => {
      // 4. 添加测试记录
      const memberIds = results.slice(0, members.length).map(res => res._id)
      const ruleIds = results.slice(members.length).map(res => res._id)
      
      const records = [
        {
          memberId: memberIds[0],
          memberName: '测试成员1',
          memberAvatar: '',
          ruleId: ruleIds[0],
          ruleTitle: '测试规则1',
          points: 10,
          _openid: 'test_openid',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          isDeleted: false,
          status: 'active',
          description: '测试积分记录1',
          type: 'reward',
          operatorId: 'test_openid',
          operatorName: '测试操作员',
          remark: '批量测试数据',
          memberPoints: 100,
          ruleType: 'reward',
          operateTime: db.serverDate()
        },
        {
          memberId: memberIds[1],
          memberName: '测试成员2',
          memberAvatar: '',
          ruleId: ruleIds[1],
          ruleTitle: '测试规则2',
          points: -5,
          _openid: 'test_openid',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          isDeleted: false,
          status: 'active',
          description: '测试积分记录2',
          type: 'penalty',
          operatorId: 'test_openid',
          operatorName: '测试操作员',
          remark: '批量测试数据',
          memberPoints: 200,
          ruleType: 'penalty',
          operateTime: db.serverDate()
        }
      ]

      return Promise.all(
        records.map(record => 
          db.collection('point_records').add({ data: record })
        )
      )
    })
    .then(results => {
      this.setData({
        result: '批量添加成功：\n' +
          `添加成员：${members.length}条\n` +
          `添加规则：${rules.length}条\n` +
          `添加记录：${results.length}条`
      })
    })
    .catch(err => {
      this.setData({
        result: '批量添加失败：' + JSON.stringify(err)
      })
    })
  },

  // 测试积分排行榜
  testPointsRanking() {
    const db = wx.cloud.database()
    db.collection('family_members')
      .where({
        isDeleted: false
      })
      .orderBy('points', 'desc')
      .get()
      .then(res => {
        this.setData({
          result: '积分排行榜：\n' + 
            res.data.map((member, index) => 
              `${index + 1}. ${member.name}: ${member.points}分`
            ).join('\n')
        })
      })
  },

  // 测试规则使用统计
  testRuleStats() {
    const db = wx.cloud.database()
    const _ = db.command
    const $ = _.aggregate

    db.collection('point_records')
      .aggregate()
      .match({
        isDeleted: false
      })
      .group({
        _id: {
          ruleId: '$ruleId',
          ruleTitle: '$ruleTitle',
          type: '$type'
        },
        count: $.sum(1),
        totalPoints: $.sum('$points')
      })
      .end()
      .then(res => {
        this.setData({
          result: '规则使用统计：\n' + 
            res.list.map(stat => 
              `${stat._id.ruleTitle}(${stat._id.type}): ${stat.count}次, 共${stat.totalPoints}分`
            ).join('\n')
        })
      })
  },

  // 测试成员积分历史
  testMemberPointsHistory() {
    const db = wx.cloud.database()
    // 先获取一个成员
    db.collection('family_members')
      .limit(1)
      .get()
      .then(res => {
        const member = res.data[0]
        if (!member) {
          throw new Error('没有找到成员')
        }
        // 查询该成员的积分记录
        return db.collection('point_records')
          .where({
            memberId: member._id,
            isDeleted: false
          })
          .orderBy('createTime', 'desc')
          .get()
      })
      .then(res => {
        this.setData({
          result: '成员积分历史：\n' + 
            res.data.map(record => 
              `${record.createTime}: ${record.ruleTitle} (${record.points}分)`
            ).join('\n')
        })
      })
  },

  // 测试每日积分统计
  testDailyStats() {
    const db = wx.cloud.database()
    const _ = db.command

    // 获取最近7天的统计
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 先获取记录
    db.collection('point_records')
      .where({
        isDeleted: false,
        createTime: _.gte(sevenDaysAgo)
      })
      .orderBy('createTime', 'asc')
      .get()
      .then(res => {
        // 手动按日期分组统计
        const dailyStats = {}
        
        res.data.forEach(record => {
          const date = new Date(record.createTime)
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          
          if (!dailyStats[dateStr]) {
            dailyStats[dateStr] = {
              count: 0,
              totalPoints: 0
            }
          }
          
          dailyStats[dateStr].count++
          dailyStats[dateStr].totalPoints += record.points
        })

        // 转换为数组并排序
        const result = Object.entries(dailyStats)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, stats]) => 
            `${date}: ${stats.count}次, 共${stats.totalPoints}分`
          )
          .join('\n')

        this.setData({
          result: '每日积分统计：\n' + (result || '暂无统计数据')
        })
      })
      .catch(err => {
        console.error('每日统计错误:', err)
        this.setData({
          result: '统计失败：' + (err.errMsg || err.message || JSON.stringify(err))
        })
      })
  },

  // 测试每月积分统计
  testMonthlyStats() {
    const db = wx.cloud.database()
    const _ = db.command

    // 获取最近6个月的统计
    const today = new Date()
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1)

    db.collection('point_records')
      .where({
        isDeleted: false,
        createTime: _.gte(sixMonthsAgo)
      })
      .orderBy('createTime', 'asc')
      .get()
      .then(res => {
        // 手动按月份分组统计
        const monthlyStats = {}
        
        res.data.forEach(record => {
          const date = new Date(record.createTime)
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!monthlyStats[monthStr]) {
            monthlyStats[monthStr] = {
              count: 0,
              totalPoints: 0,
              rewards: 0,  // 奖励次数
              penalties: 0,  // 惩罚次数
              rewardPoints: 0,  // 奖励总分
              penaltyPoints: 0  // 惩罚总分
            }
          }
          
          monthlyStats[monthStr].count++
          monthlyStats[monthStr].totalPoints += record.points

          if (record.type === 'reward') {
            monthlyStats[monthStr].rewards++
            monthlyStats[monthStr].rewardPoints += record.points
          } else if (record.type === 'penalty') {
            monthlyStats[monthStr].penalties++
            monthlyStats[monthStr].penaltyPoints += record.points
          }
        })

        // 转换为数组并排序
        const result = Object.entries(monthlyStats)
          .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
          .map(([month, stats]) => 
            `${month}: ${stats.count}次(奖${stats.rewards}/罚${stats.penalties}), ` +
            `总计${stats.totalPoints}分(+${stats.rewardPoints}/-${Math.abs(stats.penaltyPoints)})`
          )
          .join('\n')

        this.setData({
          result: '每月积分统计：\n' + (result || '暂无统计数据')
        })
      })
      .catch(err => {
        console.error('每月统计错误:', err)
        this.setData({
          result: '统计失败：' + (err.errMsg || err.message || JSON.stringify(err))
        })
      })
  },

  // 测试规则类型统计
  testRuleTypeStats() {
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('point_records')
      .where({
        isDeleted: false
      })
      .get()
      .then(res => {
        // 按规则类型分组统计
        const typeStats = {
          reward: {
            count: 0,
            totalPoints: 0,
            rules: {}  // 存储每个规则的使用情况
          },
          penalty: {
            count: 0,
            totalPoints: 0,
            rules: {}
          }
        }
        
        res.data.forEach(record => {
          const type = record.type || 'reward'
          const stats = typeStats[type]
          
          stats.count++
          stats.totalPoints += record.points

          // 统计每个规则的使用情况
          if (!stats.rules[record.ruleId]) {
            stats.rules[record.ruleId] = {
              title: record.ruleTitle,
              count: 0,
              totalPoints: 0
            }
          }
          stats.rules[record.ruleId].count++
          stats.rules[record.ruleId].totalPoints += record.points
        })

        // 格式化输出
        let result = '规则类型统计：\n'
        
        // 奖励统计
        result += `\n奖励规则：${typeStats.reward.count}次, 共${typeStats.reward.totalPoints}分\n`
        Object.values(typeStats.reward.rules)
          .sort((a, b) => b.count - a.count)
          .forEach(rule => {
            result += `  ${rule.title}: ${rule.count}次, ${rule.totalPoints}分\n`
          })
        
        // 惩罚统计
        result += `\n惩罚规则：${typeStats.penalty.count}次, 共${typeStats.penalty.totalPoints}分\n`
        Object.values(typeStats.penalty.rules)
          .sort((a, b) => b.count - a.count)
          .forEach(rule => {
            result += `  ${rule.title}: ${rule.count}次, ${rule.totalPoints}分\n`
          })

        this.setData({
          result: result || '暂无统计数据'
        })
      })
      .catch(err => {
        console.error('规则类型统计错误:', err)
        this.setData({
          result: '统计失败：' + (err.errMsg || err.message || JSON.stringify(err))
        })
      })
  },

  // 测试时段统计
  testTimeSlotStats() {
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('point_records')
      .where({
        isDeleted: false
      })
      .get()
      .then(res => {
        // 按时段分组统计
        const slotStats = {
          morning: { // 6:00-12:00
            count: 0,
            totalPoints: 0,
            rewards: 0,
            penalties: 0
          },
          afternoon: { // 12:00-18:00
            count: 0,
            totalPoints: 0,
            rewards: 0,
            penalties: 0
          },
          evening: { // 18:00-24:00
            count: 0,
            totalPoints: 0,
            rewards: 0,
            penalties: 0
          },
          night: { // 0:00-6:00
            count: 0,
            totalPoints: 0,
            rewards: 0,
            penalties: 0
          }
        }
        
        res.data.forEach(record => {
          const date = new Date(record.createTime)
          const hour = date.getHours()
          let slot
          
          if (hour >= 6 && hour < 12) {
            slot = 'morning'
          } else if (hour >= 12 && hour < 18) {
            slot = 'afternoon'
          } else if (hour >= 18 && hour < 24) {
            slot = 'evening'
          } else {
            slot = 'night'
          }
          
          slotStats[slot].count++
          slotStats[slot].totalPoints += record.points
          
          if (record.type === 'reward') {
            slotStats[slot].rewards++
          } else if (record.type === 'penalty') {
            slotStats[slot].penalties++
          }
        })

        // 格式化输出
        let result = '时段统计：\n'
        const slotNames = {
          morning: '上午(6:00-12:00)',
          afternoon: '下午(12:00-18:00)',
          evening: '晚上(18:00-24:00)',
          night: '凌晨(0:00-6:00)'
        }
        
        Object.entries(slotStats).forEach(([slot, stats]) => {
          if (stats.count > 0) {
            result += `\n${slotNames[slot]}：${stats.count}次, 共${stats.totalPoints}分\n`
            result += `  奖励：${stats.rewards}次, 惩罚：${stats.penalties}次\n`
          }
        })

        this.setData({
          result: result || '暂无统计数据'
        })
      })
      .catch(err => {
        console.error('时段统计错误:', err)
        this.setData({
          result: '统计失败：' + (err.errMsg || err.message || JSON.stringify(err))
        })
      })
  },

  // 测试操作人统计
  testOperatorStats() {
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('point_records')
      .where({
        isDeleted: false
      })
      .get()
      .then(res => {
        // 按操作人分组统计
        const operatorStats = {}
        
        res.data.forEach(record => {
          const operatorId = record.operatorId
          const operatorName = record.operatorName
          
          if (!operatorStats[operatorId]) {
            operatorStats[operatorId] = {
              name: operatorName,
              count: 0,
              totalPoints: 0,
              rewards: 0,
              penalties: 0,
              members: new Set(),  // 统计影响的成员数
              rules: new Set()     // 统计使用的规则数
            }
          }
          
          const stats = operatorStats[operatorId]
          stats.count++
          stats.totalPoints += record.points
          stats.members.add(record.memberId)
          stats.rules.add(record.ruleId)
          
          if (record.type === 'reward') {
            stats.rewards++
          } else if (record.type === 'penalty') {
            stats.penalties++
          }
        })

        // 格式化输出
        let result = '操作人统计：\n'
        
        Object.values(operatorStats)
          .sort((a, b) => b.count - a.count)
          .forEach(stats => {
            result += `\n${stats.name}：\n`
            result += `  总操作：${stats.count}次, 共${stats.totalPoints}分\n`
            result += `  奖励：${stats.rewards}次, 惩罚：${stats.penalties}次\n`
            result += `  影响成员：${stats.members.size}人\n`
            result += `  使用规则：${stats.rules.size}个\n`
          })

        this.setData({
          result: result || '暂无统计数据'
        })
      })
      .catch(err => {
        console.error('操作人统计错误:', err)
        this.setData({
          result: '统计失败：' + (err.errMsg || err.message || JSON.stringify(err))
        })
      })
  }
}) 