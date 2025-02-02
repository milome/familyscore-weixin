const db = wx.cloud.database()
const collection = db.collection('point_rules')

/**
 * 获取规则列表
 */
async function getRuleList(keyword = '') {
  console.log('Getting rules with query:', { isDeleted: false, keyword })
  const query = {
    isDeleted: false
  }
  
  if (keyword) {
    query.name = db.RegExp({
      regexp: keyword,
      options: 'i'
    })
  }

  try {
    const { data } = await collection
      .where(query)
      .orderBy('createTime', 'desc')
      .get()
    
    console.log('Got rules:', data)
    return data
  } catch (err) {
    console.error('获取规则列表失败:', err)
    throw err
  }
}

/**
 * 添加规则
 */
async function addRule(rule) {
  console.log('Adding rule:', rule)
  try {
    const data = {
      name: rule.name,
      type: rule.type,
      points: parseInt(rule.points),
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      isDeleted: false,
      _openid: '', // 由云数据库自动填充
      status: 'active'
    }
    console.log('Adding data:', data)
    const res = await collection.add({ data })
    console.log('Added rule with id:', res._id)
    return {
      _id: res._id,
      ...data
    }
  } catch (err) {
    console.error('添加规则失败:', err)
    throw err
  }
}

/**
 * 更新规则
 */
async function updateRule(id, data) {
  try {
    const updateData = {
      ...data,
      updateTime: db.serverDate()
    }
    delete updateData._openid  // 防止修改 _openid
    console.log('Updating rule:', id, updateData)
    const res = await collection.doc(id).update({
      data: updateData
    })
    console.log('Updated rule:', res)
    return res
  } catch (err) {
    console.error('更新规则失败:', err)
    throw err
  }
}

/**
 * 删除规则
 */
async function deleteRule(id, physical = false) {
  try {
    if (physical) {
      return await collection.doc(id).remove()
    }
    return await collection.doc(id).update({
      data: {
        isDeleted: true,
        deleteTime: db.serverDate()
      }
    })
  } catch (err) {
    console.error('删除规则失败:', err)
    throw err
  }
}

module.exports = {
  getRuleList,
  addRule,
  updateRule,
  deleteRule
} 