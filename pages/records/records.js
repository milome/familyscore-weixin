Page({
  data: {
    records: []
  },

  onLoad: function() {
    this.loadRecords()
  },

  onShow: function() {
    this.loadRecords()
  },

  loadRecords: function() {
    wx.cloud.database().collection('point_records')
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        // 格式化时间
        const records = res.data.map(record => ({
          ...record,
          createTime: this.formatTime(record.createTime)
        }))
        this.setData({
          records: records
        })
      })
  },

  addRecord: function() {
    wx.navigateTo({
      url: '/pages/records/add'
    })
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}) 