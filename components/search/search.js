Component({
  properties: {
    className: String,
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '搜索'
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    showHistory: {
      type: Boolean,
      value: true
    },
    maxHistory: {
      type: Number,
      value: 10
    },
    focus: {
      type: Boolean,
      value: false
    }
  },

  data: {
    history: []
  },

  lifetimes: {
    attached() {
      // 从本地存储加载搜索历史
      const history = wx.getStorageSync('searchHistory') || []
      this.setData({ history })
    }
  },

  methods: {
    onInput(e) {
      const value = e.detail.value
      this.triggerEvent('input', value)
    },

    onSearch(e) {
      const value = e.detail.value
      this.triggerEvent('search', value)
    },

    onClear() {
      this.triggerEvent('input', '')
      this.triggerEvent('search', '')
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onHistoryTap(e) {
      const value = e.currentTarget.dataset.keyword
      this.triggerEvent('input', { value })
      this.triggerEvent('search', { value })
    },

    clearHistory() {
      wx.showModal({
        title: '提示',
        content: '确定要清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({ history: [] })
            wx.removeStorageSync('searchHistory')
          }
        }
      })
    },

    saveHistory(keyword) {
      let history = this.data.history
      // 去重
      history = history.filter(item => item !== keyword)
      // 添加到开头
      history.unshift(keyword)
      // 限制数量
      history = history.slice(0, this.data.maxHistory)
      
      this.setData({ history })
      wx.setStorageSync('searchHistory', history)
    }
  }
}) 