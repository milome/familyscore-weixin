// pages/statistics/overview/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stats: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadStats()
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

  async loadStats() {
    const db = wx.cloud.database()
    // 获取统计数据
    const res = await db.collection('point_records')
      .where({ isDeleted: false })
      .get()

    // 处理统计数据
    const stats = {
      total: res.data.length,
      totalPoints: 0,
      rewards: 0,
      penalties: 0
    }

    res.data.forEach(record => {
      stats.totalPoints += record.points
      if (record.type === 'reward') {
        stats.rewards++
      } else if (record.type === 'penalty') {
        stats.penalties++
      }
    })

    this.setData({ stats })
  }
})