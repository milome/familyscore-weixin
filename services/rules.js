const db = wx.cloud.database()
const collection = db.collection('point_rules')
const _ = db.command

/**
 * 获取规则列表
 */
async function getRuleList() {
  try {
    const { data } = await collection
      .where({
        isDeleted: _.neq(true)
      })
      .orderBy('createTime', 'desc')
      .get()
    
    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取规则列表失败:', err)
    throw err
  }
}

/**
 * 添加规则
 */
async function addRule(data) {
  try {
    const { _id } = await collection.add({
      data: {
        ...data,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false,
        status: 'active'
      }
    })

    return {
      success: true,
      data: { _id }
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
    delete updateData._openid
    console.log('Updating rule:', id, updateData)
    await collection.doc(id).update({
      data: updateData
    })
    console.log('Updated rule:')
    return {
      success: true
    }
  } catch (err) {
    console.error('更新规则失败:', err)
    throw err
  }
}

/**
 * 删除规则
 */
async function deleteRule(id) {
  try {
    await collection.doc(id).update({
      data: {
        isDeleted: true,
        deleteTime: db.serverDate()
      }
    })

    return {
      success: true
    }
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