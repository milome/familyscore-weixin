Page({
  data: {
    id: '',
    formData: {
      avatar: '',
      name: '',
      points: 0
    }
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadMemberData(options.id)
    }
  },

  loadMemberData: function(id) {
    wx.cloud.database().collection('family_members')
      .doc(id)
      .get()
      .then(res => {
        this.setData({
          formData: res.data
        })
      })
  },

  chooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  uploadAvatar: function(filePath) {
    const cloudPath = `avatars/${Date.now()}.jpg`
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        this.setData({
          'formData.avatar': res.fileID
        })
      }
    })
  },

  submitForm: function(e) {
    const formData = e.detail.value
    formData.avatar = this.data.formData.avatar
    formData.points = parseInt(formData.points) || 0

    const db = wx.cloud.database()
    if (this.data.id) {
      // 更新
      db.collection('family_members')
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
      db.collection('family_members')
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