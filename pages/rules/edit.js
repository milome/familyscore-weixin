Page({
  data: {
    id: '',
    formData: {
      title: '',
      points: 0,
      description: ''
    }
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadRuleData(options.id)
    }
  },

  loadRuleData: function(id) {
    wx.cloud.database().collection('point_rules')
      .doc(id)
      .get()
      .then(res => {
        this.setData({
          formData: res.data
        })
      })
  },

  submitForm: function(e) {
    const formData = e.detail.value
    formData.points = parseInt(formData.points) || 0

    if (!formData.title) {
      wx.showToast({
        title: '请输入规则名称',
        icon: 'none'
      })
      return
    }

    const db = wx.cloud.database()
    if (this.data.id) {
      // 更新
      db.collection('point_rules')
        .doc(this.data.id)
        .update({
          data: formData
        })
        .then(() => {
          wx.showToast({
            title: '更新成功'
          })
          wx.navigateBack()
        })
    } else {
      // 新增
      db.collection('point_rules')
        .add({
          data: formData
        })
        .then(() => {
          wx.showToast({
            title: '添加成功'
          })
          wx.navigateBack()
        })
    }
  }
}) 