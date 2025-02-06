// pages/settings/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    isParent: true,  // 临时设置为家长角色
    isChild: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
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

  // 编辑个人信息
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 显示关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '家庭积分管理小程序，帮助家长更好地管理孩子的积分奖励。',
      showCancel: false
    })
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？清除后需要重新登录。',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.clearStorageSync()
          
          wx.showToast({
            title: '清除成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              // 延迟跳转到登录页
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/login/login'
                })
              }, 1500)
            }
          })
        }
      }
    })
  },

  goToFamily() {
    wx.navigateTo({
      url: '/pages/members/list/index?tab=family'
    })
  },

  goToMembers() {
    wx.navigateTo({
      url: '/pages/members/list/index'
    })
  },

  goToRules() {
    wx.navigateTo({
      url: '/pages/rules/list/index'
    })
  },

  // 添加刮刮卡管理导航
  goToScratchManage() {
    wx.navigateTo({
      url: '/pages/scratch/list/index?mode=manage'
    })
  }
})