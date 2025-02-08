// 数据预加载器
const DataPreloader = {
  // 预加载队列
  queue: new Map(),
  
  // 添加预加载任务
  async addTask(childId, task) {
    if (!this.queue.has(childId)) {
      this.queue.set(childId, [])
    }
    this.queue.get(childId).push(task)
    
    // 如果队列中只有一个任务，开始执行
    if (this.queue.get(childId).length === 1) {
      await this.processQueue(childId)
    }
  },
  
  // 处理预加载队列
  async processQueue(childId) {
    const tasks = this.queue.get(childId)
    while (tasks.length > 0) {
      const task = tasks[0]
      try {
        await task()
      } catch (err) {
        console.error('预加载任务失败:', err)
      }
      tasks.shift()
    }
  }
} 