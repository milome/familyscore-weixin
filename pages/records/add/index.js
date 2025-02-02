// pages/records/add/index.js
const { addRecord } = require('../../../services/records')
const { getMemberList } = require('../../../services/members')
const { getRuleList } = require('../../../services/rules')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {
      date: '',
      memberId: '',
      memberName: '',
      ruleId: '',
      ruleName: '',
      type: 'reward',  // reward 或 penalty
      points: 0,
      remark: ''
    },
    members: [],
    rules: [],
    memberIndex: -1,
    ruleIndex: -1,
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.loadMembers()
    this.loadRules()
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

  async loadMembers() {
    try {
      const members = await getMemberList()
      this.setData({ 
        members,
        memberIndex: -1,
        'form.memberId': '',
        'form.memberName': ''
      })
    } catch (err) {
      console.error('加载成员失败:', err)
    }
  },

  async loadRules() {
    try {
      const rules = await getRuleList()
      this.setData({ 
        rules,
        ruleIndex: -1,
        'form.ruleId': '',
        'form.ruleName': '',
        'form.type': 'reward',
        'form.points': 0
      })
    } catch (err) {
      console.error('加载规则失败:', err)
    }
  },

  onMemberChange(e) {
    const index = e.detail.value
    const member = this.data.members[index]
    this.setData({
      'form.memberId': member._id,
      'form.memberName': member.name,
      memberIndex: index
    })
  },

  onRuleChange(e) {
    const index = e.detail.value
    const rule = this.data.rules[index]
    if (rule) {
      this.setData({
        'form.ruleId': rule._id,
        'form.ruleName': rule.name,
        'form.type': rule.type,
        'form.points': rule.points,
        ruleIndex: index
      })
    }
  },

  onDateChange(e) {
    this.setData({
      'form.date': e.detail
    })
  },

  async handleSubmit() {
    const { form } = this.data
    
    if (!form.date) {
      return wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
    }
    if (!form.memberId) {
      return wx.showToast({
        title: '请选择成员',
        icon: 'none'
      })
    }
    if (!form.ruleId) {
      return wx.showToast({
        title: '请选择规则',
        icon: 'none'
      })
    }

    this.setData({ submitting: true })
    try {
      const data = {
        memberId: form.memberId,
        memberName: form.memberName,
        ruleId: form.ruleId,
        ruleName: form.ruleName,
        type: form.type,
        points: form.points
      }
      await addRecord(data)
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('添加失败:', err)
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
})