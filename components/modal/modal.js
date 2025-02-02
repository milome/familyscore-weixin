Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: String,
    content: String,
    confirmText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmLoading: {
      type: Boolean,
      value: false
    },
    cancelLoading: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onConfirm() {
      this.triggerEvent('confirm')
    },

    onCancel() {
      this.triggerEvent('cancel')
    }
  }
}) 