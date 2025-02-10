Page({
  data: {
    loading: true,
    records: []
  },
  
  async onLoad(options) {
    // 获取当前选中的孩子ID
    const currentChildId = wx.getStorageSync('currentChildId')
    if (!currentChildId) {
      wx.showToast({
        title: '请先选择孩子',
        icon: 'none'
      })
      return
    }
    this.currentChildId = currentChildId
    await this.loadRecords()
  },
  
  async loadRecords() {
    try {
      this.setData({ loading: true })
      
      const db = wx.cloud.database()
      const _ = db.command
      
      // 先检查当前孩子是否存在且未删除
      const { data: children } = await db.collection('children')
        .where({
          _id: this.currentChildId,
          isDeleted: false
        })
        .get()
      
      // 如果孩子不存在或已删除，不显示任何记录
      if (!children.length) {
        this.setData({
          records: [],
          loading: false
        })
        return
      }
      
      // 查询积分记录
      const { data: records } = await db.collection('point_records')
        .where({
          childId: this.currentChildId,
          isDeleted: false,
          createTime: _.and(
            _.gte('2025-01-31T00:00:00.000Z'), 
            _.lte('2025-02-27T00:00:00.000Z')
          )
        })
        .orderBy('createTime', 'desc')
        .get()
      
      // 使用查询到的孩子信息
      const processedRecords = records.map(record => ({
        ...record,
        childName: children[0].name,
        childAvatar: children[0].avatar
      }))
      
      this.setData({
        records: processedRecords,
        loading: false
      })
      
    } catch (err) {
      console.error('加载积分记录失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 