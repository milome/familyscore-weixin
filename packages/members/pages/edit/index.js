// packages/members/pages/edit/index.js
const { addMember, updateMember, deleteMember } = require('../../services/members')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    form: {
      name: '',
      remark: '',
      avatarUrl: ''
    },
    submitting: false,
    showDeleteModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadMember(options.id)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  async loadMember(id) {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('family_members').doc(id).get()
      
      this.setData({
        form: {
          name: data.name,
          remark: data.remark || '',
          avatarUrl: data.avatarUrl || ''
        }
      })
    } catch (err) {
      console.error('加载成员信息失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  async chooseAvatar() {
    try {
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed']
      })

      const filePath = tempFilePaths[0]
      const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(-6)}.${filePath.match(/\.(\w+)$/)[1]}`

      wx.showLoading({ title: '上传中...' })
      const { fileID } = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })

      this.setData({
        'form.avatarUrl': fileID
      })
    } catch (err) {
      console.error('上传头像失败:', err)
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  async handleSubmit(e) {
    const { name, remark } = e.detail.value
    if (!name) {
      return wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
    }

    this.setData({ submitting: true })
    try {
      const data = {
        name,
        remark,
        avatarUrl: this.data.form.avatarUrl
      }

      if (this.data.id) {
        await updateMember(this.data.id, data)
      } else {
        await addMember(data)
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
      await deleteMember(this.data.id)

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