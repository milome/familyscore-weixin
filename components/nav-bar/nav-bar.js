Component({
  properties: {
    title: String,
    fixed: {
      type: Boolean,
      value: true
    },
    showBack: {
      type: Boolean,
      value: true
    }
  },

  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      })
    }
  },

  methods: {
    goBack() {
      wx.navigateBack({
        delta: 1
      })
    },
    onBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    }
  }
}) 