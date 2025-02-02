const { addRule, updateRule } = require('../../../services/rules')

Page({
  data: {
    id: '',
    form: {
      name: '',
      type: 'reward',
      points: ''
    },
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadRule(options.id)
    }
  },

  async loadRule(id) {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('point_rules').doc(id).get()
      
      this.setData({
        form: {
          name: data.name,
          type: data.type,
          points: data.points
        }
      })
    } catch (err) {
      console.error('加载规则失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  onNameInput(e) {
    this.setData({
      'form.name': e.detail.value
    })
  },

  onTypeChange(e) {
    this.setData({
      'form.type': e.detail.value
    })
  },

  onPointsInput(e) {
    this.setData({
      'form.points': e.detail.value
    })
  },

  async handleSubmit() {
    const { form } = this.data
    if (!form.name) {
      return wx.showToast({
        title: '请输入规则名称',
        icon: 'none'
      })
    }
    if (!form.points) {
      return wx.showToast({
        title: '请输入积分值',
        icon: 'none'
      })
    }

    this.setData({ submitting: true })
    try {
      const data = {
        name: form.name.trim(),
        type: form.type,
        points: parseInt(form.points),
        createTime: new Date(),
        updateTime: new Date(),
        isDeleted: false
      }

      if (this.data.id) {
        await updateRule(this.data.id, data)
      } else {
        await addRule(data)
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
  }
}) 