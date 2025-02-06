import { navigate } from '../../../utils/navigator'
const { getMemberList, deleteMember } = require('../../../services/members')

Page({
  data: {
    loading: false,
    keyword: '',
    showDeleteModal: false,
    deletingId: '',
    children: []
  },

  onLoad() {
    this.loadMembers()
  },

  onShow() {
    this.loadMembers()
  },

  onPullDownRefresh() {
    this.loadMembers()
  },

  async loadMembers() {
    try {
      this.setData({ loading: true })
      const children = await getMemberList('children')
      this.setData({ 
        children,
        loading: false
      })
      wx.stopPullDownRefresh()
    } catch (err) {
      console.error('加载宝贝列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
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

  addChild() {
    wx.navigateTo({
      url: '/pages/members/children/edit/index'
    })
  },

  editChild(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/members/children/edit/index?id=${id}`
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
  },

  stopPropagation() {
    // 仅用于阻止事件冒泡
  }
}) 