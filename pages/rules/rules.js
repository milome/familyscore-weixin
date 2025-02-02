Page({
  data: {
    rules: []
  },

  onLoad: function() {
    this.loadRules()
  },

  onShow: function() {
    this.loadRules()
  },

  loadRules: function() {
    wx.cloud.database().collection('point_rules')
      .get()
      .then(res => {
        this.setData({
          rules: res.data
        })
      })
  },

  addRule: function() {
    wx.navigateTo({
      url: '/pages/rules/edit'
    })
  },

  editRule: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/rules/edit?id=${id}`
    })
  },

  deleteRule: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该规则吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.database().collection('point_rules')
            .doc(id)
            .remove()
            .then(() => {
              wx.showToast({
                title: '删除成功'
              })
              this.loadRules()
            })
        }
      }
    })
  }
}) 