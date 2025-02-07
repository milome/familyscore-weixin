const { getRuleList } = require('../../../services/rules')
const { getMonthRecords } = require('../../../services/records')
const { formatFriendlyDate } = require('../../../utils/date')
const db = wx.cloud.database()
const _ = db.command
const { getCurrentChild } = require('../../../services/user')

Page({
  data: {
    date: '',
    rules: [],
    currentChild: null
  },

  async onLoad(options) {
    const { date } = options
    
    // 获取当前孩子
    const currentChild = await getCurrentChild()
    
    this.setData({
      date: formatFriendlyDate(new Date(date)),
      currentChild
    })
    
    this.loadRules(date)
  },

  async loadRules(date) {
    try {
      // 获取所有规则
      const { data: rules } = await getRuleList()
      
      // 获取当天记录
      const records = await this.getDayRecords(date)
      
      // 标记已完成的规则
      const markedRules = rules.map(rule => ({
        ...rule,
        checked: records.some(record => record.ruleId === rule._id)
      }))
      
      this.setData({ rules: markedRules })
    } catch (err) {
      console.error('加载规则失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  async getDayRecords(date) {
    if (!this.data.currentChild) return []
    
    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(23, 59, 59, 999)

    const { data } = await db.collection('point_records')
      .where({
        childId: this.data.currentChild._id,
        isDeleted: false,
        createTime: _.gte(startTime).and(_.lte(endTime)),
      })
      .orderBy('createTime', 'desc')
      .get()

    return data
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
}) 