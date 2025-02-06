const scratchService = require('../../../services/scratch')

Page({
  data: {
    loading: true,
    cards: [],
    showDeleteModal: false,
    deletingId: '',
    isManageMode: false,  // 是否是管理模式
    isParent: true,
    isChild: false
  },

  async onLoad(options) {
    // 设置管理模式
    this.setData({
      isManageMode: options.mode === 'manage'
    })

    try {
      await this.loadCards()
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  onShow() {
    this.loadCards()
  },

  onPullDownRefresh() {
    this.loadCards()
  },

  async loadCards() {
    try {
      this.setData({ loading: true })
      const { data: cards } = await scratchService.getCardList()
      this.setData({ 
        cards,
        loading: false
      })
      wx.stopPullDownRefresh()
    } catch (err) {
      console.error('加载刮刮卡列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  createCard() {
    wx.navigateTo({
      url: '/pages/scratch/create/index'
    })
  },

  // 只在非管理模式下才能玩游戏
  playCard(e) {
    if (this.data.isManageMode) return
    
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/scratch/play/index?id=${id}`
    })
  },

  editCard(e) {
    const { id } = e.currentTarget.dataset
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
      await scratchService.deleteCard(this.data.deletingId)
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      this.hideDeleteModal()
      this.loadCards()
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  stopPropagation() {
    // 阻止事件冒泡
  }
}) 