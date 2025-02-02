Page({
  data: {},

  handleLogin() {
    // 直接跳转到首页
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
}) 