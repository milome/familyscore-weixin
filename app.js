App({
  onLaunch: function () {
    // 先初始化全局数据
    this.globalData = {
      db: null,
      userInfo: null,
      family: null
    }

    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'family-points-prod-4d5iv61e5e32a',  // 确保这是正确的环境ID
        traceUser: true,
      })

      // 直接使用云开发数据库
      this.globalData.db = wx.cloud.database()
    }

    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      // 直接跳转到测试页面
      wx.reLaunch({
        url: '/pages/test/test'
      })
    } else {
      // 未登录，跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  },

  // 检查是否已登录
  checkLogin() {
    if (!this.globalData.userInfo) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  }
}) 