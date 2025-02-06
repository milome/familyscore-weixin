// const { checkAuth } = require('../../../utils/auth')  // 注释掉权限检查
const scratchService = require('../../../services/scratch')

Page({
  data: {
    form: {
      title: '',
      description: '',
      points: '',
      probability: 0.5
    },
    submitting: false
  },

  onProbabilityChange(e) {
    this.setData({
      'form.probability': e.detail.value / 100
    })
  },

  async handleSubmit(e) {
    const { title, description, points } = e.detail.value
    const { probability } = this.data.form

    if (!title || !description || !points) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ submitting: true })

      await scratchService.createCard({
        title,
        description,
        points: Number(points),
        probability
      })

      wx.showToast({
        title: '创建成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (err) {
      console.error('创建失败:', err)
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  async onLoad() {
    // 注释掉权限检查
    // await checkAuth(this, ['parent'])
  }
}) 