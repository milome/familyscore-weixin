Component({
  properties: {
    currentChild: {
      type: Object,
      value: null
    }
  },

  data: {
    showDrawer: false
  },

  methods: {
    // 打开切换抽屉
    openSwitcher() {
      this.setData({ showDrawer: true })
    },

    // 关闭抽屉
    closeDrawer() {
      this.setData({ showDrawer: false })
    },

    // 切换孩子
    async switchChild(e) {
      const { id } = e.currentTarget.dataset
      if (id === this.properties.currentChild?._id) {
        this.closeDrawer()
        return
      }

      try {
        await wx.showLoading({ title: '切换中...' })
        await userService.setCurrentChild(id)
        this.triggerEvent('switch')
        this.closeDrawer()
      } catch (err) {
        console.error('切换失败:', err)
        wx.showToast({
          title: '切换失败',
          icon: 'error'
        })
      } finally {
        wx.hideLoading()
      }
    }
  }
}) 