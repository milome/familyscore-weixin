const app = getApp()

Page({
  data: {
    canIUseGetUserProfile: false,
    loading: false
  },

  onLoad() {
    // 直接跳转到首页
    wx.reLaunch({
      url: '/pages/index/index'
    })

    // if (wx.getUserProfile) {
    //   this.setData({
    //     canIUseGetUserProfile: true
    //   })
    // }
  },

  async handleLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'login'
      })

      wx.setStorageSync('userInfo', result.userInfo)
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      console.error('登录失败:', err)
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async getUserProfile() {
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      return userInfo
    } catch (err) {
      throw new Error('获取用户信息失败')
    }
  }
}) 