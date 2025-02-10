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
    today: new Date().toISOString().split('T')[0], // 获取今天的日期作为日期选择器的结束日期
    childId: ''
  },

  async onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ 
        mode: 'edit',
        id: id  // 确保正确设置id
      })
      await this.loadChildDetail(id)
    }
  },

  // 加载孩子详情
  async loadChildDetail(id) {
    try {
      this.setData({ loading: true })
      
      const db = wx.cloud.database()
      const { data: child } = await db.collection('children')
        .doc(id)
        .get()
      
      // 获取最新的头像临时URL
      let avatarTemp = child.avatar || ''  // 使用 avatar 字段
      if (avatarTemp && avatarTemp.startsWith('cloud://')) {
        try {
          const { fileList } = await wx.cloud.getTempFileURL({
            fileList: [avatarTemp]
          })
          avatarTemp = fileList[0].tempFileURL
        } catch (err) {
          console.error('获取头像临时链接失败:', err)
        }
      }

      this.setData({
        name: child.name,
        avatar: avatarTemp,
        gender: child.gender,
        birthday: child.birthday,
        loading: false
      })

    } catch (err) {
      console.error('加载孩子详情失败:', err)
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
        console.log('chooseAvatar - 选择的临时文件:', tempFilePaths[0])
        
        // 上传到云存储，使用正确的云环境ID
        const { fileID } = await wx.cloud.uploadFile({
          cloudPath: `children/avatar/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
          filePath: tempFilePaths[0]
        })
        console.log('chooseAvatar - 上传后的fileID:', fileID)
        
        this.setData({ avatar: fileID })
      }
    } catch (err) {
      console.error('选择头像失败:', err)
      wx.showToast({
        title: '选择头像失败',
        icon: 'none'
      })
    }
  },

  onImageError(e) {
    console.error('头像加载失败:', e.detail)
    this.setData({ avatar: '' })  // 清空头像，显示文本头像
  },

  // 保存
  async onSave() {
    try {
      this.setData({ loading: true })

      const { name, avatar, gender, birthday } = this.data
      
      // 表单验证
      if (!name) {
        wx.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return
      }

      const data = {
        name,
        gender,
        birthday,
        avatar  // 使用 avatar 字段
      }

      console.log('handleSubmit - 准备保存的头像URL:', data.avatar)

      if (this.data.id) {
        // 更新
        await userService.updateChild(this.data.id, data)
      } else {
        // 新增
        await userService.addChild(data)
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
        title: err.message || '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 