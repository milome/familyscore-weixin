Page({
  data: {
    records: [],
    loading: true,
    hasMore: true,
    pageSize: 20,
    filter: {
      startDate: '',
      endDate: '',
      type: ''
    },
    currentChild: null
  },

  async onLoad(options) {
    // 获取当前选中的孩子
    const currentChildId = wx.getStorageSync('currentChildId')
    if (!currentChildId) {
      wx.showToast({
        title: '请先选择孩子',
        icon: 'none'
      })
      return
    }
    
    // 获取孩子信息
    const db = wx.cloud.database()
    const { data: child } = await db.collection('children')
      .doc(currentChildId)
      .field({
        _id: true,
        name: true,
        avatar: true
      })
      .get()
    
    this.setData({ currentChild: child })
    await this.loadRecords()
  },

  onPullDownRefresh() {
    this.setData({
      records: [],
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重置列表并重新加载
    this.setData({
      records: [],
      hasMore: true
    }, () => {
      this.loadRecords()
    })
  },

  async loadRecords() {
    try {
      this.setData({ loading: true })
      
      const db = wx.cloud.database()
      const _ = db.command
      
      // 确保有当前孩子
      if (!this.data.currentChild?._id) {
        console.log('loadRecords: 没有当前孩子')
        return
      }
      
      // 处理头像URL
      if (this.data.currentChild.avatar && this.data.currentChild.avatar.startsWith('cloud://')) {
        try {
          const { fileList } = await wx.cloud.getTempFileURL({
            fileList: [this.data.currentChild.avatar]
          })
          this.setData({
            'currentChild.avatar': fileList[0].tempFileURL
          })
        } catch (err) {
          console.error('获取头像临时链接失败:', err)
        }
      }

      const query = {
        childId: this.data.currentChild._id,  // 只查询当前孩子的记录
        isDeleted: false
      }

      const { data } = await db.collection('point_records')
        .where(query)
        .orderBy('createTime', 'desc')
        .get()
      
      // 处理记录，使用当前孩子信息
      const processedRecords = data.map(record => ({
        ...record,
        childName: this.data.currentChild.name,
        childAvatar: this.data.currentChild.avatar,
        createTime: this.formatTime(record.createTime)  // 格式化时间显示
      }))
      
      this.setData({
        records: processedRecords,
        loading: false
      })
      
    } catch (err) {
      console.error('加载记录失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
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

  formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  },

  goBack() {
    wx.navigateBack()
  }
}) 