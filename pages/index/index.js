// const { checkAuth } = require('../../utils/auth')  // 注释掉权限检查
const app = getApp()
const scratchService = require('../../services/scratch')  // 添加这行
const userService = require('../../services/user')
const { getCurrentChild, getChildPoints } = require('../../services/user')
const { formatDate, isSameDay } = require('../../utils/date')
const { getMonthRecords } = require('../../services/records')  // 添加这行

Page({
  data: {
    userInfo: {
      nickName: '测试用户',
      avatarUrl: '/images/default-avatar.png'
    },
    monthStats: {
      total: 0,
      totalPoints: 0,
      rewards: 0,
      penalties: 0
    },
    recentRecords: [],
    loading: true,
    refreshing: false,
    children: [],
    overview: {
      totalPoints: 0,
      rewardCount: 0,
      penaltyCount: 0,
      records: []
    },
    isParent: true,
    isChild: false,
    currentChild: null,
    childList: [],
    familyList: [],
    calendarData: [],
    currentMonth: ''
  },

  async onLoad() {
    try {
      // 获取当前孩子
      const child = await getCurrentChild()
      if (child) {
        const { points } = await getChildPoints(child._id)
        console.log('首页当前孩子信息:', {
          id: child._id,
          name: child.name,
          points
        })
      }
    } catch (err) {
      console.error('获取孩子信息失败:', err)
    }

    await this.loadData()
    // 初始化日历并加载记录
    if (this.data.currentChild) {
      this.initCalendarData()
      await this.loadMonthRecords()
    }
  },

  async onShow() {
    try {
      // 先清空当前积分，避免显示旧数据
      if (this.data.currentChild) {
        this.setData({
          'currentChild.points': 0
        })
      }
      
      // 使用 loadData 统一加载最新数据
      await this.loadData()
      
      // 只重新加载月度记录，不重新初始化日历
      if (this.data.currentChild) {
        await this.loadMonthRecords()
      }
      
      // 添加日志
      if (this.data.currentChild) {
        console.log('首页 onShow 后的积分:', {
          childId: this.data.currentChild._id,
          name: this.data.currentChild.name,
          points: this.data.currentChild.points
        })
      }
    } catch (err) {
      console.error('onShow 刷新数据失败:', err)
    }
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      // 获取当前孩子
      const currentChild = await getCurrentChild()
      
      if (currentChild) {
        console.log('loadData - 原始头像URL:', {
          avatar: currentChild.avatar,
          type: typeof currentChild.avatar
        })

        // 获取最新积分
        const { points } = await getChildPoints(currentChild._id)

        // 处理头像URL
        let avatarTemp = currentChild.avatar || ''
        if (avatarTemp) {
          console.log('loadData - 使用头像URL:', avatarTemp)
        }

        console.log('loadData - 最终头像URL:', currentChild.avatar)

        // 获取孩子列表
        const { data: childList } = await userService.getChildList()
        
        this.setData({
          loading: false,
          currentChild: {
            ...currentChild,
            points
          },
          childList: childList.map(child => {
            if (child._id === currentChild._id) {
              return { ...child, points }  // 更新列表中当前孩子的积分
            }
            return child
          })
        })
        
        // 加载家人列表
        await this.loadFamilyList(currentChild._id)
        
        // 加载本月统计
        await this.loadMonthStats()

        // 加载最近记录
        await this.loadRecentRecords()

        console.log('首页数据加载完成:', {
          childId: currentChild._id,
          name: currentChild.name,
          points,
          recentRecords: this.data.recentRecords.length,
          time: new Date().toISOString()
        })
      } else {
        this.setData({ 
          loading: false,
          currentChild: null 
        })
      }

    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载家人列表
  async loadFamilyList(childId) {
    try {
      const { data } = await userService.getChildFamily(childId)
      this.setData({ familyList: data })
    } catch (err) {
      console.error('加载家人列表失败:', err)
      this.setData({ familyList: [] })
    }
  },

  // 切换孩子后重新加载
  async onChildSwitch() {
    await this.loadData()
  },

  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {
        nickName: '测试用户',
        avatarUrl: '/images/default-avatar.png'
      }
      this.setData({ userInfo })
    } catch (err) {
      console.error('加载用户信息失败:', err)
    }
  },

  async loadChildren() {
    try {
      const { getMemberList } = require('../../services/members')
      const children = await getMemberList('children') || []
      this.setData({ children })
    } catch (err) {
      console.error('加载孩子列表失败:', err)
      this.setData({ children: [] })
    }
  },

  async loadMonthStats() {
    try {
      const db = wx.cloud.database()
      const _ = db.command
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // 确保有当前孩子
      if (!this.data.currentChild?._id) {
        console.log('loadMonthStats: 没有当前孩子')
        return
      }

      // 只查询当前孩子的记录
      const res = await db.collection('point_records')
        .where({
          childId: this.data.currentChild._id,
          isDeleted: _.neq(true),
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
        if (record.points) {
          if (record.type === 'reward') {
            stats.totalPoints += record.points
            stats.rewards++
          } else if (record.type === 'penalty') {
            stats.totalPoints -= record.points
            stats.penalties++
          }
        }
      })

      console.log('本月统计:', {
        childId: this.data.currentChild._id,
        childName: this.data.currentChild.name,
        stats
      })

      this.setData({ monthStats: stats })
    } catch (err) {
      console.error('加载月度统计失败:', err)
      // 保持默认值
    }
  },

  async loadRecentRecords() {
    try {
      if (!this.data.currentChild?._id) {
        console.log('loadRecentRecords: 没有当前孩子')
        return
      }

      console.log('开始加载最近记录:', {
        childId: this.data.currentChild._id,
        childName: this.data.currentChild.name,
        time: new Date().toISOString()
      })

      const db = wx.cloud.database()
      const _ = db.command  // 添加 command 引用

      // 构建查询条件
      const query = {
        childId: this.data.currentChild._id,
        isDeleted: _.neq(true)
      }

      console.log('查询条件:', query)

      const res = await db.collection('point_records')
        .where(query)
        .orderBy('createTime', 'desc')
        .limit(5)
        .get()

      console.log('数据库查询结果:', {
        total: res.data?.length || 0,
        records: res.data
      })

      const records = (res.data || []).map(record => {
        const formatted = {
          ...record,
          memberName: this.data.currentChild.name,
          ruleName: record.ruleName || '未知规则',
          createTime: this.formatTime(record.createTime || new Date())
        }
        console.log('格式化记录:', formatted)
        return formatted
      })

      console.log('最终记录列表:', {
        childId: this.data.currentChild._id,
        childName: this.data.currentChild.name,
        total: records.length,
        records,
        time: new Date().toISOString()
      })

      this.setData({ recentRecords: records })
    } catch (err) {
      console.error('加载最近记录失败:', {
        error: err,
        childId: this.data.currentChild?._id,
        time: new Date().toISOString()
      })
      this.setData({ recentRecords: [] })
    }
  },

  async onRefresh() {
    if (this.data.refreshing) return
    this.setData({ refreshing: true })
    try {
      await Promise.all([
        this.loadMonthStats().catch(() => {}),
        this.loadRecentRecords().catch(() => {})
      ])
    } finally {
      this.setData({ refreshing: false })
    }
  },

  formatTime(date) {
    try {
      date = new Date(date)
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    } catch (err) {
      console.error('时间格式化失败:', err)
      return '未知时间'
    }
  },

  // 页面跳转方法
  addRecord() {
    wx.navigateTo({
      url: '/pages/records/list/index'
    })
  },

  goToMembers() {
    wx.navigateTo({ url: '/pages/members/list/index?tab=children' })
  },

  goToRules() {
    wx.navigateTo({ url: '/pages/rules/list/index' })
  },

  goToStats() {
    wx.navigateTo({ url: '/pages/statistics/overview/index' })
  },

  goToRecords() {
    wx.navigateTo({ url: '/pages/records/list/index' })
  },

  playScratchGame() {
    wx.showModal({
      title: '兑换积分',
      editable: true,
      placeholderText: '请输入要兑换的积分数量',
      success: async (res) => {
        if (res.confirm) {
          const points = parseInt(res.content)
          if (isNaN(points) || points <= 0) {
            wx.showToast({
              title: '请输入有效积分',
              icon: 'none'
            })
            return
          }

          try {
            // 获取匹配的刮刮卡
            const { data: card } = await scratchService.getRandomCard(points)
            if (!card) {
              wx.showToast({
                title: '暂无匹配的刮刮卡',
                icon: 'none'
              })
              return
            }

            // 跳转到游戏页面
            wx.navigateTo({
              url: `/pages/scratch/play/index?id=${card._id}`
            })
          } catch (err) {
            console.error('获取刮刮卡失败:', err)
            wx.showToast({
              title: '获取刮刮卡失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 添加跳转方法
  goToAddChild() {
    wx.navigateTo({
      url: '/pages/child/edit/index'
    })
  },

  // 添加家人
  addFamilyMember() {
    if (!this.data.currentChild) return
    wx.navigateTo({
      url: `/pages/family/edit/index?childId=${this.data.currentChild._id}`
    })
  },

  // 编辑家人
  editFamily(e) {
    const { id } = e.currentTarget.dataset
    if (!this.data.currentChild) return
    wx.navigateTo({
      url: `/pages/family/edit/index?childId=${this.data.currentChild._id}&id=${id}`
    })
  },

  // 跳转到家人管理页面
  goToFamilyManage() {
    if (!this.data.currentChild) return
    wx.navigateTo({
      url: `/pages/family/manage/index?childId=${this.data.currentChild._id}`
    })
  },

  // 跳转到编辑孩子页面
  goToEditChild() {
    if (!this.data.currentChild) return
    
    console.log('跳转到编辑孩子页面:', {
      childId: this.data.currentChild._id,
      childName: this.data.currentChild.name
    })
    
    wx.navigateTo({
      url: `/pages/child/edit/index?id=${this.data.currentChild._id}`
    })
  },

  // 初始化日历数据
  initCalendarData() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    // 设置当前月份显示
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                         '七月', '八月', '九月', '十月', '十一月', '十二月']
    this.setData({
      currentMonth: monthNames[month]
    })

    // 获取当月第一天是周几
    const firstDay = new Date(year, month, 1).getDay()
    // 获取当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    let calendarData = []
    let week = []
    
    // 补充上月空白日期
    for (let i = 0; i < firstDay; i++) {
      week.push({ day: '' })
    }
    
    // 填充当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dateStr = formatDate(date)  // 使用导入的 formatDate
      
      week.push({
        day: i,
        date: dateStr,
        isToday: isSameDay(date, new Date()),  // 使用导入的 isSameDay
        hasRecords: false,
        reward: 0,
        penalty: 0
      })
      
      if (week.length === 7) {
        calendarData.push(week)
        week = []
      }
    }
    
    // 补充下月空白日期
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: '' })
      }
      calendarData.push(week)
    }
    
    this.setData({ calendarData })
  },

  // 加载当月记录
  async loadMonthRecords() {
    try {
      console.log('开始加载月度记录:', {
        childId: this.data.currentChild._id,
        childName: this.data.currentChild.name,
        time: new Date().toISOString()
      })

      const records = await getMonthRecords(this.data.currentChild._id, new Date())
      console.log('获取到月度记录:', {
        recordCount: records.length,
        records: records.map(r => ({
          date: new Date(r.createTime).toLocaleDateString(),
          type: r.type,
          points: r.points,
          isReward: r.isReward
        }))
      })

      this.updateCalendarWithRecords(records)
    } catch (err) {
      console.error('加载记录失败:', err)
    }
  },

  // 更新日历数据
  updateCalendarWithRecords(records) {
    const calendarData = this.data.calendarData.map(week => {
      return week.map(day => {
        if (!day.date) return day
        
        // 获取当天的记录
        const dayRecords = records.filter(record => {
          const recordDate = new Date(record.createTime)
          return formatDate(recordDate) === day.date
        })
        
        // 添加日志，只打印有记录的日期
        if (dayRecords.length > 0) {
          console.log('日期记录统计:', {
            date: day.date,
            recordCount: dayRecords.length,
            records: dayRecords.map(r => ({
              type: r.type,
              points: r.points,
              isReward: r.isReward,
              ruleId: r.ruleId
            }))
          })
        }

        // 计算奖励和惩罚积分
        const reward = dayRecords
          .filter(r => r.type === 'reward')
          .reduce((sum, r) => sum + r.points, 0)
          
        const penalty = dayRecords
          .filter(r => {
            // 使用 ruleId 字段来区分惩罚记录和兑换记录
            return r.type === 'penalty' && r.ruleId
          })
          .reduce((sum, r) => sum + r.points, 0)
        
        return {
          ...day,
          hasRecords: dayRecords.length > 0,
          reward: reward || 0,
          penalty: penalty || 0
        }
      })
    })
    
    this.setData({ calendarData })
  },

  // 点击日期
  onDateClick(e) {
    const { date } = e.currentTarget.dataset
    if (!date) return
    
    console.log('点击日历日期:', {
      date,
      childId: this.data.currentChild._id,
      childName: this.data.currentChild.name,
      time: new Date().toISOString()
    })
    
    wx.navigateTo({
      url: `/pages/records/detail/index?date=${date}`
    })
  }
})