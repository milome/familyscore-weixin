Component({
  properties: {
    title: String,
    subtitle: String,
    value: String,
    icon: String,
    arrow: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onClick() {
      this.triggerEvent('tap')
    }
  }
}) 