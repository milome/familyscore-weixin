const userService = require('../../../services/user')

Page({
  data: {
    id: '',
    name: '',
    avatar: '',
    gender: 'male',
    birthday: '',
    loading: false,
    mode: 'add',
    today: new Date().toISOString().split('T')[0] // 获取今天的日期作为日期选择器的结束日期
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ 
        id: options.id,
        mode: 'edit'
      })
      this.loadChildDetail(options.id)
    }
  },

  // 加载孩子详情
  async loadChildDetail(id) {
    try {
      this.setData({ loading: true })
      const { data } = await userService.getChildDetail(id)
      this.setData({
        name: data.name,
        avatar: data.avatar,
        gender: data.gender,
        birthday: data.birthday
      })
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 选择性别
  onGenderSelect(e) {
    this.setData({
      gender: e.currentTarget.dataset.gender
    })
  },

  // 选择生日
  onBirthdayChange(e) {
    this.setData({
      birthday: e.detail.value
    })
  },

  // 选择头像
  async chooseAvatar() {
    try {
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (tempFilePaths && tempFilePaths[0]) {
        // 上传头像到云存储
        wx.showLoading({ title: '上传中...' })
        const { fileID } = await wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}.jpg`,
          filePath: tempFilePaths[0]
        })
        
        this.setData({ avatar: fileID })
      }
    } catch (err) {
      console.error('选择头像失败:', err)
      wx.showToast({
        title: '选择头像失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 保存
  async onSave() {
    const { name, avatar, gender, birthday, mode, id } = this.data
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }

    if (!birthday) {
      wx.showToast({
        title: '请选择生日',
        icon: 'none'
      })
      return
    }

    if (!gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loading: true })

      const childData = {
        name: name.trim(),
        gender,
        birthday,
        avatar: avatar || ''
      }

      let result
      if (mode === 'add') {
        result = await userService.addChild(childData)
      } else {
        result = await userService.updateChild(id, childData)
      }

      if (!result.success) {
        if (result.error === 'CHILD_EXISTS') {
          wx.showToast({
            title: result.message,
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          })
        }
        return
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 