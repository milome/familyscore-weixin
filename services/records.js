const db = wx.cloud.database()
const collection = db.collection('point_records')
const _ = db.command
const userService = require('./user')

/**
 * 添加积分记录
 */
async function addRecord(data) {
  try {
    // 创建积分记录
    const recordData = {
      childId: data.childId,
      childName: data.childName,
      ruleId: data.ruleId,
      ruleName: data.ruleName,
      points: data.points,
      type: data.type,
      date: data.date,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      isDeleted: false
    }

    // 添加记录
    const { _id } = await collection.add({
      data: recordData
    })

    // 更新孩子的积分
    const pointChange = data.type === 'reward' ? data.points : -data.points
    await userService.addPoints(data.childId, pointChange)

    return {
      success: true,
      data: { _id }
    }
  } catch (err) {
    console.error('添加积分记录失败:', err)
    return {
      success: false,
      message: '保存失败'
    }
  }
}

/**
 * 获取积分记录列表
 */
async function getRecordList(childId, options = {}) {
  try {
    const query = {
      childId,
      isDeleted: _.neq(true)
    }

    if (options.startDate && options.endDate) {
      query.date = _.gte(options.startDate).and(_.lte(options.endDate))
    }

    const { data } = await collection
      .where(query)
      .orderBy('date', 'desc')
      .get()

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取积分记录失败:', err)
    throw err
  }
}

/**
 * 获取最近记录
 */
async function getRecentRecords(childId, limit = 5) {
  try {
    const { data } = await collection
      .where({
        childId,
        isDeleted: _.neq(true)
      })
      .orderBy('createTime', 'desc')
      .limit(limit)
      .get()

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取最近记录失败:', err)
    throw err
  }
}

/**
 * 删除积分记录
 */
async function deleteRecord(recordId) {
  try {
    // 先获取记录信息
    const { data: record } = await collection.doc(recordId).get()
    if (!record) {
      return {
        success: false,
        message: '记录不存在'
      }
    }

    // 更新孩子积分（反向操作）
    const pointChange = record.type === 'reward' ? -record.points : record.points
    await userService.addPoints(record.childId, pointChange)

    // 标记记录为删除
    await collection.doc(recordId).update({
      data: {
        isDeleted: true,
        deleteTime: db.serverDate()
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('删除积分记录失败:', err)
    throw err
  }
}

module.exports = {
  addRecord,
  getRecordList,
  getRecentRecords,
  deleteRecord
} 