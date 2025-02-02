Page({
  data: {
    members: []
  },

  onLoad: function() {
    this.loadMembers()
  },

  onShow: function() {
    this.loadMembers()
  },

  loadMembers: function() {
    wx.cloud.database().collection('family_members')
      .get()
      .then(res => {
        this.setData({
          members: res.data
        })
      })
  },

  addMember: function() {
    wx.navigateTo({
      url: '/pages/members/edit'
    })
  },

  editMember: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/members/edit?id=${id}`
    })
  },

  deleteMember: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该成员吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.database().collection('family_members')
            .doc(id)
            .remove()
            .then(() => {
              wx.showToast({
                title: '删除成功'
              })
              this.loadMembers()
            })
        }
      }
    })
  }
}) 