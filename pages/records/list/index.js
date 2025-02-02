Page({
  data: {
    records: [],
    loading: false,
    hasMore: true,
    pageSize: 20,
    keyword: '',
    filter: {
      startDate: '',
      endDate: '',
      type: ''
    }
  },

  onLoad() {
    // 设置默认日期范围为本月
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    this.setData({
      'filter.startDate': startDate.toISOString().split('T')[0],
      'filter.endDate': endDate.toISOString().split('T')[0]
    })
    
    this.loadRecords()
  },

  onPullDownRefresh() {
    this.setData({
      records: [],
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  async loadRecords() {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const _ = db.command
      const query = {
        isDeleted: false
      }

      // 添加日期筛选
      if (this.data.filter.startDate && this.data.filter.endDate) {
        query.createTime = _.gte(new Date(this.data.filter.startDate))
          .and(_.lte(new Date(this.data.filter.endDate)))
      }

      // 添加类型筛选
      if (this.data.filter.type) {
        query.type = this.data.filter.type
      }

      // 添加关键词搜索
      if (this.data.keyword) {
        query.memberName = db.RegExp({
          regexp: this.data.keyword,
          options: 'i'
        })
      }

      const { data } = await db.collection('point_records')
        .where(query)
        .orderBy('createTime', 'desc')
        .skip(this.data.records.length)
        .limit(this.data.pageSize)
        .get()

      // 格式化时间
      const records = data.map(record => ({
        ...record,
        createTime: this.formatTime(record.createTime)
      }))

      this.setData({
        records: [...this.data.records, ...records],
        hasMore: data.length === this.data.pageSize
      })
    } catch (err) {
      console.error('加载记录失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  onSearch(e) {
    this.setData({
      keyword: e.detail,
      records: [],
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  onDateChange(e) {
    const { startDate, endDate } = e.detail
    this.setData({
      'filter.startDate': startDate,
      'filter.endDate': endDate,
      records: [],
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  onTypeChange(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      'filter.type': type,
      records: [],
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  loadMore() {
    this.loadRecords()
  },

  addRecord() {
    wx.navigateTo({
      url: '/pages/records/add/index'
    })
  },

  editRecord(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/records/edit/index?id=${id}`
    })
  },

  formatTime(date) {
    date = new Date(date)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`
  }
}) 