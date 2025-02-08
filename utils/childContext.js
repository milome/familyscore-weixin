const CONTEXT_KEY = 'childContextMap'

// 上下文管理器
const ChildContextManager = {
  // 获取指定孩子的上下文
  async getContext(childId) {
    try {
      const contextMap = await wx.getStorage(CONTEXT_KEY) || {}
      return contextMap[childId] || this.createDefaultContext()
    } catch (err) {
      console.error('获取上下文失败:', err)
      return this.createDefaultContext()
    }
  },

  // 保存上下文
  async saveContext(childId, context) {
    try {
      const contextMap = await wx.getStorage(CONTEXT_KEY) || {}
      contextMap[childId] = {
        ...contextMap[childId],
        ...context,
        lastVisitTime: new Date()
      }
      await wx.setStorage({
        key: CONTEXT_KEY,
        data: contextMap
      })
    } catch (err) {
      console.error('保存上下文失败:', err)
    }
  },

  // 创建默认上下文
  createDefaultContext() {
    return {
      lastVisitTime: new Date(),
      lastPage: '/pages/index/index',
      calendarMonth: new Date().toISOString().slice(0, 7),
      filterSettings: {
        dateRange: 'thisMonth',
        ruleTypes: ['reward', 'penalty']
      }
    }
  }
} 