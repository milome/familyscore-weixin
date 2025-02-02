Component({
  properties: {
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '请选择日期'
    }
  },

  data: {
    date: ''
  },

  lifetimes: {
    attached() {
      if (this.properties.value) {
        this.setData({ date: this.properties.value })
      } else {
        // 默认当前日期
        const now = new Date()
        this.setData({ 
          date: this.formatDate(now)
        })
      }
    }
  },

  methods: {
    onConfirm(e) {
      console.log('选择日期:', e.detail.value)
      const date = e.detail.value
      this.setData({ 
        date
      })
      this.triggerEvent('change', date)
    },

    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}) 