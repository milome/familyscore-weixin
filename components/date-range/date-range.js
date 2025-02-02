Component({
  properties: {
    className: String,
    label: String,
    startDate: {
      type: String,
      value: ''
    },
    endDate: {
      type: String,
      value: ''
    },
    start: String,
    end: String,
    startPlaceholder: {
      type: String,
      value: '开始日期'
    },
    endPlaceholder: {
      type: String,
      value: '结束日期'
    }
  },

  methods: {
    onStartDateChange(e) {
      const startDate = e.detail.value
      this.triggerEvent('change', {
        startDate,
        endDate: this.data.endDate
      })
    },

    onEndDateChange(e) {
      const endDate = e.detail.value
      this.triggerEvent('change', {
        startDate: this.data.startDate,
        endDate
      })
    }
  }
}) 