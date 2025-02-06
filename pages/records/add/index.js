// pages/records/add/index.js
const db = wx.cloud.database()
const _ = db.command
const { addRecord } = require('../../../services/records')
const { getChildList, getCurrentChild, addPoints } = require('../../../services/user')  // 使用 user 服务获取孩子列表
const { getRuleList } = require('../../../services/rules')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    selectedMember: null,
    selectedRule: null,
    loading: false,
    memberList: [], // 存储孩子列表
    ruleList: [],
    currentChild: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      // 使用服务层方法获取数据
      const [{ data: children }, { data: rules }] = await Promise.all([
        getChildList(),  // 从 children 集合获取列表
        getRuleList()    // 从 rules 集合获取列表
      ])

      console.log('规则列表:', rules) // 添加日志以便调试

      this.setData({
        memberList: children,
        ruleList: rules
      })
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 选择成员
  onMemberChange(e) {
    const index = e.detail.value
    const member = this.data.memberList[index]
    this.setData({
      selectedMember: member
    })
  },

  // 选择规则
  onRuleChange(e) {
    const index = e.detail.value
    const rule = this.data.ruleList[index]
    console.log('选择的规则:', rule) // 添加日志以便调试
    this.setData({
      selectedRule: rule
    })
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      date: e.detail
    })
  },

  // 保存记录
  async saveRecord() {
    const { date, selectedMember, selectedRule } = this.data
    
    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }

    if (!selectedMember) {
      wx.showToast({
        title: '请选择孩子',
        icon: 'none'
      })
      return
    }

    if (!selectedRule) {
      wx.showToast({
        title: '请选择规则',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loading: true })

      // 使用服务层方法添加记录
      const result = await addRecord({
        childId: selectedMember._id,
        childName: selectedMember.name,
        ruleId: selectedRule._id,
        ruleName: selectedRule.name,
        points: selectedRule.points,
        type: selectedRule.type,
        date: new Date(date)
      })

      if (!result.success) {
        wx.showToast({
          title: result.message || '保存失败',
          icon: 'none'
        })
        return
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async handleSubmit() {
    if (this.data.loading) return
    if (!this.data.selectedRule) {
      wx.showToast({
        title: '请选择规则',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loading: true })
      
      // 获取当前孩子
      const child = await getCurrentChild()
      if (!child) {
        wx.showToast({
          title: '请先选择孩子',
          icon: 'none'
        })
        return
      }

      // 添加积分记录
      const rule = this.data.selectedRule
      console.log('添加积分记录:', {
        childId: child._id,
        ruleId: rule._id,
        ruleName: rule.name,
        points: rule.points,
        time: new Date().toISOString()
      })

      await addPoints(child._id, rule.points)

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })

      // 返回上一页
      wx.navigateBack()
    } catch (err) {
      console.error('添加失败:', err)
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})