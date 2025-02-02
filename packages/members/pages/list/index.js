// packages/members/pages/list/index.js
const { getMemberList, deleteMember } = require('../../services/members')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    members: [],
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
    this.loadMembers()
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
    this.loadMembers()
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
    this.loadMembers()
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
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      console.log('开始加载成员列表')
      const data = await getMemberList(this.data.keyword)
      console.log('获取到成员列表:', data)
      
      this.setData({ 
        members: data,
        isEmpty: !data || data.length === 0
      })
    } catch (err) {
      console.error('加载成员失败:', err)
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
      this.loadMembers()
    })
  },

  addMember() {
    wx.navigateTo({
      url: '../edit/index'
    })
  },

  editMember(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../edit/index?id=${id}`
    })
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
      await deleteMember(this.data.deletingId)

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })

      this.hideDeleteModal()
      this.loadMembers()
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
})