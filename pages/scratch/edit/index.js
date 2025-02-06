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

  onInput(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    console.log('表单输入:', { field, value })
    
    this.setData({
      [`form.${field}`]: value
    })
  },

  async handleSubmit() {
    if (this.data.submitting) return
    
    const { form } = this.data
    
    // 表单验证
    if (!form.title) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!form.points || form.points <= 0) {
      wx.showToast({
        title: '请输入有效积分',
        icon: 'none'
      })
      return
    }
    
    this.setData({ submitting: true })
    try {
      console.log('准备保存刮刮卡:', {
        id: this.data.id,
        form
      })

      if (this.data.id) {
        // 使用 scratchService 更新刮刮卡
        await scratchService.updateCard(this.data.id, {
          title: form.title,
          description: form.description,
          points: parseInt(form.points)
        })
      } else {
        // 创建刮刮卡
        await scratchService.createCard({
          title: form.title,
          description: form.description,
          points: parseInt(form.points)
        })
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