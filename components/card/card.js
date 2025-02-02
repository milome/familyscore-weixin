Component({
  properties: {
    title: String,
    subtitle: String,
    className: String
  },

  methods: {
    onSubtitleTap() {
      this.triggerEvent('tap')
    },
    onMoreTap() {
      this.triggerEvent('more')
    }
  }
}) 