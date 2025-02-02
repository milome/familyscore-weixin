// pages/rules/list/index.js
const { getRuleList, deleteRule } = require('../../../services/rules')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules: [],
    loading: false,
    keyword: '',
    showDeleteModal: false,
    deletingId: '',
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    this.loadRules()
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
    this.loadRules()
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

  async loadRules() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const data = await getRuleList(this.data.keyword)
      this.setData({ 
        rules: data,
        isEmpty: !data || data.length === 0
      })
    } catch (err) {
      console.error('加载规则失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  onSearch(e) {
    this.setData({
      keyword: e.detail
    }, () => {
      this.loadRules()
    })
  },

  addRule() {
    console.log('添加规则')
    try {
      wx.navigateTo({
        url: '/pages/rules/edit/index',
        fail: (err) => {
          console.error('导航失败:', err)
          wx.showToast({
            title: '导航失败',
            icon: 'error'
          })
        }
      })
    } catch (err) {
      console.error('导航错误:', err)
      wx.showToast({
        title: '系统错误',
        icon: 'error'
      })
    }
  },

  editRule(e) {
    console.log('编辑规则:', e.currentTarget.dataset.id)
    const { id } = e.currentTarget.dataset
    try {
      wx.navigateTo({
        url: `/pages/rules/edit/index?id=${id}`,
        fail: (err) => {
          console.error('导航失败:', err)
          wx.showToast({
            title: '导航失败',
            icon: 'error'
          })
        }
      })
    } catch (err) {
      console.error('导航错误:', err)
      wx.showToast({
        title: '系统错误',
        icon: 'error'
      })
    }
  },

  showDeleteConfirm(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ 
      showDeleteModal: true,
      deletingId: id
    })
  },

  hideDeleteModal() {
    this.setData({ 
      showDeleteModal: false,
      deletingId: ''
    })
  },

  async confirmDelete() {
    if (!this.data.deletingId) return
    
    try {
      await deleteRule(this.data.deletingId)
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      this.hideDeleteModal()
      this.loadRules()
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  async deleteRule(e) {
    const { id } = e.currentTarget.dataset
    const { deleteRule } = require('../../../services/rules')

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条规则吗？',
      async success(res) {
        if (res.confirm) {
          try {
            await deleteRule(id)
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadRules()
          } catch (err) {
            console.error('删除失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})