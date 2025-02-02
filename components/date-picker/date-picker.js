Component({
  properties: {
    label: String,
    value: String,
    placeholder: {
      type: String,
      value: '请选择日期'
    },
    start: String,  // YYYY-MM-DD
    end: String,    // YYYY-MM-DD
    fields: {       // year/month/day
      type: String,
      value: 'day'
    }
  },

  methods: {
    onChange(e) {
      const value = e.detail.value
      this.triggerEvent('change', { value })
    }
  }
}) 