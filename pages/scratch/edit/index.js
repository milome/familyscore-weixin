const scratchService = require('../../../services/scratch')

Page({
  data: {
    id: '',
    form: {
      title: '',
      description: '',
      points: '',
      probability: 0.5
    },
    submitting: false,
    showDeleteModal: false
  },

  async onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      await this.loadCard(options.id)
    }
  },

  async loadCard(id) {
    try {
      this.setData({ loading: true })
      const { data } = await scratchService.getCardDetail(id)
      
      this.setData({
        form: {
          title: data.title,
          description: data.description,
          points: data.points,
          probability: data.probability
        },
        loading: false
      })
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
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

      await scratchService.updateCard(this.data.id, {
        title,
        description,
        points: Number(points),
        probability
      })

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
      this.setData({ submitting: false })
    }
  },

  showDeleteConfirm() {
    this.setData({ showDeleteModal: true })
  },

  hideDeleteModal() {
    this.setData({ showDeleteModal: false })
  },

  async handleDelete() {
    try {
      await scratchService.deleteCard(this.data.id)
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
}) 