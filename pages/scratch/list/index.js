const scratchService = require('../../../services/scratch')

Page({
  data: {
    loading: true,
    list: [],
    showDeleteModal: false,
    deletingId: ''
  },

  async onLoad(options) {
    try {
      await this.loadData()
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  async loadData() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('scratch_cards').get()
      this.setData({ 
        list: data,
        loading: false
      })
    } catch (err) {
      console.error('加载失败:', err)
      this.setData({ loading: false })
    }
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/scratch/edit/index'
    })
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/scratch/edit/index?id=${id}`
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
      const db = wx.cloud.database()
      await db.collection('scratch_cards')
        .doc(this.data.deletingId)
        .remove()
        
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
      this.hideDeleteModal()
      this.loadData()
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
}) 