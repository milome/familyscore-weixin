const db = wx.cloud.database()
const collection = db.collection('point_records')

/**
 * 添加记录
 */
async function addRecord(record) {
  const data = {
    ...record,
    createTime: db.serverDate(),
    updateTime: db.serverDate(),
    isDeleted: false
  }
  const { _id } = await collection.add({ data })
  return {
    _id,
    ...data
  }
}

/**
 * 获取孩子的积分记录
 * @param {Array} childrenIds 孩子ID列表
 * @param {Object} options 查询选项
 */
async function getChildrenRecords(childrenIds, options = {}) {
  try {
    const query = {
      isDeleted: false,
      memberId: db.command.in(childrenIds)
    }

    // 添加时间范围查询
    if (options.startTime) {
      query.createTime = query.createTime || {}
      query.createTime = db.command.gte(options.startTime)
    }
    if (options.endTime) {
      query.createTime = query.createTime || {}
      query.createTime = db.command.lte(options.endTime)
    }

    const { data } = await collection
      .where(query)
      .orderBy('createTime', 'desc')
      .get()

    return data
  } catch (err) {
    console.error('获取孩子记录失败:', err)
    throw err
  }
}

module.exports = {
  addRecord,
  getChildrenRecords
} 