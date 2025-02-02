import { navigate } from '../../../utils/navigator'
const { getMemberList, deleteMember } = require('../../../services/members')

Page({
  data: {
    members: [],
    loading: false,
    keyword: '',
    showDeleteModal: false,
    deletingId: '',
    isEmpty: false
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
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const data = await getMemberList(this.data.keyword)
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
    console.log('添加成员')
    try {
      wx.navigateTo({
        url: '/pages/members/edit/index',
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

  editMember(e) {
    console.log('编辑成员:', e.currentTarget.dataset.id)
    const { id } = e.currentTarget.dataset
    try {
      wx.navigateTo({
        url: `/pages/members/edit/index?id=${id}`,
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