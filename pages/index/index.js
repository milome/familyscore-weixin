const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '测试用户',
      avatarUrl: '/images/default-avatar.png'
    },
    monthStats: {
      total: 128,
      totalPoints: 520,
      rewards: 88,
      penalties: 40
    },
    recentRecords: [
      {
        _id: '1',
        memberName: '小明',
        memberAvatar: '/images/default-avatar.png',
        type: 'reward',
        points: 10,
        ruleName: '按时完成作业',
        createTime: '3月15日 14:30'
      },
      {
        _id: '2',
        memberName: '小红',
        memberAvatar: '/images/default-avatar.png',
        type: 'penalty',
        points: 5,
        ruleName: '玩手机超时',
        createTime: '3月15日 12:20'
      }
    ],
    loading: false,    // 骨架屏加载状态
    refreshing: false, // 下拉刷新状态
    children: [], // 当前用户的孩子列表
    overview: {
      totalPoints: 0,
      rewardCount: 0,
      penaltyCount: 0,
      records: []
    }
  },

  onLoad() {
    this.loadChildren()
    this.loadOverview()
  },

  async loadChildren() {
    try {
      const { getMyChildren } = require('../../services/members')
      const children = await getMyChildren()
      this.setData({ children })
    } catch (err) {
      console.error('加载孩子列表失败:', err)
    }
  },

  async loadOverview() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      if (!this.data.children.length) {
        this.setData({
          overview: {
            totalPoints: 0,
            rewardCount: 0,
            penaltyCount: 0,
            records: []
          }
        })
        return
      }

      const childrenIds = this.data.children.map(child => child._id)
      const now = new Date()
      const startTime = new Date(now.getFullYear(), now.getMonth(), 1) // 本月1号
      const endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0) // 本月最后一天

      const { getChildrenRecords } = require('../../services/records')
      const records = await getChildrenRecords(childrenIds, {
        startTime,
        endTime
      })

      // 计算统计数据
      const overview = {
        totalPoints: 0,
        rewardCount: 0,
        penaltyCount: 0,
        records: records.slice(0, 5) // 只显示最近5条记录
      }

      records.forEach(record => {
        if (record.type === 'reward') {
          overview.totalPoints += record.points
          overview.rewardCount++
        } else {
          overview.totalPoints -= record.points
          overview.penaltyCount++
        }
      })

      this.setData({ overview })
    } catch (err) {
      console.error('加载概览数据失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async onRefresh() {
    if (this.data.refreshing) return
    this.setData({ refreshing: true })
    try {
      await this.loadOverview()
    } finally {
      this.setData({ refreshing: false })
    }
  },

  // 卡片切换动画
  switchCard(selector, direction = 'next') {
    const card = this.selectComponent(selector)
    if (!card) return

    card.setData({ className: 'leaving' })
    setTimeout(() => {
      // 更新数据
      card.setData({ className: 'entering' })
      setTimeout(() => {
        card.setData({ className: '' })
      }, 300)
    }, 300)
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadMonthStats()
    this.loadRecentRecords()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
  },

  async loadMonthStats() {
    const db = wx.cloud.database()
    const _ = db.command
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const res = await db.collection('point_records')
      .where({
        isDeleted: false,
        createTime: _.gte(firstDay).and(_.lte(lastDay))
      })
      .get()

    const stats = {
      total: res.data.length,
      totalPoints: 0,
      rewards: 0,
      penalties: 0
    }

    res.data.forEach(record => {
      stats.totalPoints += record.points
      if (record.type === 'reward') {
        stats.rewards++
      } else if (record.type === 'penalty') {
        stats.penalties++
      }
    })

    this.setData({ monthStats: stats })
  },

  async loadRecentRecords() {
    const db = wx.cloud.database()
    const res = await db.collection('point_records')
      .where({
        isDeleted: false
      })
      .orderBy('createTime', 'desc')
      .limit(5)
      .get()

    // 格式化时间
    const records = res.data.map(record => ({
      ...record,
      createTime: this.formatTime(record.createTime)
    }))

    this.setData({ recentRecords: records })
  },

  formatTime(date) {
    date = new Date(date)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`
  },

  addRecord() {
    wx.navigateTo({
      url: '/pages/records/add/index'
    })
  },

  goToMembers() {
    wx.navigateTo({
      url: '/pages/members/list/index'
    })
  },

  goToRules() {
    wx.navigateTo({
      url: '/pages/rules/list/index'
    })
  },

  goToStats() {
    wx.navigateTo({
      url: '/pages/statistics/overview/index'
    })
  },

  goToRecords() {
    wx.navigateTo({
      url: '/pages/records/list/index'
    })
  }
}) 