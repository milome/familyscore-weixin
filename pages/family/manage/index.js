const userService = require('../../../services/user')

Page({
  data: {
    childId: '',
    childInfo: null,
    familyList: [],
    loading: true
  },

  onLoad(options) {
    if (options.childId) {
      this.setData({ childId: options.childId })
      this.loadData()
    }
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      const [childInfo, { data: familyList }] = await Promise.all([
        userService.getChildDetail(this.data.childId),
        userService.getChildFamily(this.data.childId)
      ])

      this.setData({
        childInfo,
        familyList
      })
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

  // 添加家人
  addFamily() {
    wx.navigateTo({
      url: `/pages/family/edit/index?childId=${this.data.childId}`
    })
  },

  // 编辑家人
  editFamily(e) {
    const { id } = e.currentTarget.dataset
    const member = this.data.familyList.find(m => m._id === id)
    if (!member) return
    wx.navigateTo({
      url: `/pages/family/edit/index?childId=${this.data.childId}&id=${member.memberId}`
    })
  },

  // 删除家人
  async deleteFamily(e) {
    const { id } = e.currentTarget.dataset
    const member = this.data.familyList.find(m => m._id === id)
    if (!member) return
    
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: `确定要删除${member.name}吗？`,
        confirmText: '删除'
      })

      if (res.confirm) {
        await userService.deleteFamilyRelation(id)
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        this.loadData()
      }
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  // 添加返回方法
  goBack() {
    wx.navigateBack()
  }
}) 