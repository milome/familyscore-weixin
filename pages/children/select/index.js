Page({
  data: {
    children: [],
    loading: false
  },

  onLoad() {
    this.loadChildren()
  },

  async loadChildren() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('children')
        .where({
          isDeleted: db.command.neq(true)
        })
        .get()

      this.setData({ children: data })
    } catch (err) {
      console.error('加载孩子列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  selectChild(e) {
    const { id } = e.currentTarget.dataset
    const child = this.data.children.find(c => c._id === id)
    if (child) {
      wx.setStorageSync('currentChild', child)
      wx.showToast({
        title: '已选择',
        icon: 'success'
      })
      wx.navigateBack()
    }
  },

  addChild() {
    wx.navigateTo({
      url: '/pages/children/add/index'
    })
  }
}) 