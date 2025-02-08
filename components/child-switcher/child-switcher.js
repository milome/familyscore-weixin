Component({
  properties: {
    currentChild: {
      type: Object,
      value: null
    },
    childList: {
      type: Array,
      value: []
    }
  },

  data: {
    showPanel: false,
    animationData: {}
  },

  methods: {
    // 展开/收起面板
    togglePanel() {
      const animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-out'
      })
      
      if (!this.data.showPanel) {
        animation.translateY(0).opacity(1).step()
      } else {
        animation.translateY(-100).opacity(0).step()
      }
      
      this.setData({
        showPanel: !this.data.showPanel,
        animationData: animation.export()
      })
    },

    // 选择孩子
    async selectChild(e) {
      const { childId } = e.currentTarget.dataset
      
      try {
        // 保存选择到本地
        await wx.setStorage({
          key: 'currentChildId',
          data: childId
        })
        
        // 触发切换事件
        this.triggerEvent('switch', { childId })
        
        // 关闭面板
        this.togglePanel()
      } catch (err) {
        console.error('切换孩子失败:', err)
        wx.showToast({
          title: '切换失败',
          icon: 'error'
        })
      }
    },

    // 添加新孩子
    addChild() {
      wx.navigateTo({
        url: '/pages/child/edit/index'
      })
    }
  }
}) 