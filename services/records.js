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
    const db = wx.cloud.database()
    const _ = db.command
    
    const query = {
      childId,
      isDeleted: false,  // 使用等值查询替代 neq
    }
    
    // 添加日期筛选
    if (options.startDate && options.endDate) {
      query.createTime = _.gte(new Date(options.startDate))
        .and(_.lte(new Date(options.endDate)))
    }
    
    // 添加类型筛选
    if (options.type) {
      query.type = options.type
    }
    
    const { data } = await db.collection('point_records')
      .where(query)
      // 按照索引建议的顺序
      .orderBy('childId', 'asc')
      .orderBy('isDeleted', 'asc')
      .orderBy('createTime', 'asc')
      .get()
    
    // 在内存中反转数组以获得降序效果
    const sortedData = data.reverse()
    
    return {
      success: true,
      data: sortedData
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
        isDeleted: false
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

/**
 * 获取指定月份的记录
 */
async function getMonthRecords(childId, date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  try {
    // 先获取总数
    const { total } = await db.collection('point_records')
      .where({
        childId,
        isDeleted: false,
        createTime: _.gte(startDate).and(_.lte(endDate))
      })
      .count()
    
    // 分批次获取所有数据
    const batchSize = 20
    const batchTimes = Math.ceil(total / batchSize)
    const tasks = []
    
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('point_records')
        .where({
          childId,
          isDeleted: false,
          createTime: _.gte(startDate).and(_.lte(endDate))
        })
        // 使用降序索引
        .orderBy('createTime', 'desc')
        .skip(i * batchSize)
        .limit(batchSize)
        .get()
      
      tasks.push(promise)
    }

    // 等待所有查询完成
    const results = await Promise.all(tasks)

    // 合并查询结果
    const data = results.reduce((acc, cur) => {
      return acc.concat(cur.data)
    }, [])

    console.log('月度记录查询结果:', {
      total,
      batchTimes,
      recordCount: data.length
    })

    return data
  } catch (err) {
    console.error('获取月度记录失败:', err)
    throw err
  }
}

module.exports = {
  addRecord,
  getRecordList,
  getRecentRecords,
  deleteRecord,
  getMonthRecords
} 