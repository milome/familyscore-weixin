const db = wx.cloud.database()
const _ = db.command

/**
 * 获取当前选中的孩子
 */
async function getCurrentChild() {
  try {
    // 从本地存储获取当前选中的孩子ID
    const currentChildId = wx.getStorageSync('currentChildId')
    if (!currentChildId) {
      // 如果没有选中的孩子，尝试获取第一个孩子
      const { data } = await db.collection('children')
        .where({
          isDeleted: _.neq(true)
        })
        .orderBy('createTime', 'desc')
        .limit(1)
        .get()

      if (data && data.length > 0) {
        // 找到第一个孩子，设置为当前选中
        const child = data[0]
        await setCurrentChild(child._id)
        return child
      }
      return null
    }

    try {
      // 尝试获取指定ID的孩子信息
      const { data } = await db.collection('children')
        .doc(currentChildId)
        .field({
          _id: true,
          name: true,
          avatar: true,
          points: true,
          birthday: true,
          gender: true
        })
        .get()
      
      return data
    } catch (err) {
      console.error('获取指定孩子失败，尝试获取第一个孩子:', err)
      
      // 如果获取指定ID的孩子失败，尝试获取第一个孩子
      const { data } = await db.collection('children')
        .where({
          isDeleted: _.neq(true)
        })
        .orderBy('createTime', 'desc')
        .limit(1)
        .get()

      if (data && data.length > 0) {
        // 找到第一个孩子，更新当前选中
        const child = data[0]
        await setCurrentChild(child._id)
        return child
      }
      return null
    }
  } catch (err) {
    console.error('获取当前孩子失败:', err)
    return null
  }
}

/**
 * 设置当前选中的孩子
 */
async function setCurrentChild(childId) {
  try {
    wx.setStorageSync('currentChildId', childId)
    return {
      success: true
    }
  } catch (err) {
    console.error('设置当前孩子失败:', err)
    throw err
  }
}

/**
 * 获取孩子列表
 */
async function getChildList() {
  try {
    const { data } = await db.collection('children')
      .where({
        isDeleted: _.neq(true)
      })
      .orderBy('updateTime', 'desc')
      .field({
        _id: true,
        name: true,
        avatar: true,
        points: true,
        birthday: true,
        gender: true
      })
      .get()
    
    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取孩子列表失败:', err)
    throw err
  }
}

/**
 * 获取孩子积分
 */
async function getChildPoints(childId) {
  if (!childId) {
    return {
      success: true,
      points: 0
    }
  }

  try {
    const $ = db.command.aggregate
    // 从 point_records 集合计算总积分
    const { list } = await db.collection('point_records')
      .aggregate()
      .match({
        childId,
        isDeleted: _.neq(true)
      })
      .group({
        _id: null,
        totalPoints: $.sum($.cond({
          if: $.eq(['$type', 'reward']),
          then: '$points',
          else: $.multiply(['$points', -1])  // penalty 类型取负值
        }))
      })
      .end()

    const points = list.length > 0 ? list[0].totalPoints : 0
    
    // 添加详细日志
    console.log('积分计算详情:', {
      childId,
      points,
      aggregateResult: list,
      time: new Date().toISOString()
    })

    // 再查询一下原始记录用于验证
    const records = await db.collection('point_records')
      .where({
        childId,
        isDeleted: _.neq(true)
      })
      .orderBy('createTime', 'desc')
      .get()

    console.log('积分记录详情:', {
      childId,
      records: records.data,
      time: new Date().toISOString()
    })

    return {
      success: true,
      points
    }
  } catch (err) {
    console.error('获取孩子积分失败:', err)
    throw err
  }
}

/**
 * 增加积分
 */
async function addPoints(childId, points) {
  if (!childId) {
    return {
      success: false,
      message: '孩子ID不能为空'
    }
  }

  try {
    console.log('开始增加积分:', {
      childId,
      points,
      time: new Date().toISOString()
    })

    // 在 point_records 集合中创建奖励记录
    const recordData = {
      childId,
      points: Math.abs(points),
      type: 'reward',  // 增加积分使用 reward 类型
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      isDeleted: false
    }

    const result = await db.collection('point_records').add({
      data: recordData
    })

    console.log('积分增加完成:', {
      childId,
      points,
      recordId: result._id,
      time: new Date().toISOString()
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('增加积分失败:', {
      childId,
      points,
      error: err,
      time: new Date().toISOString()
    })
    throw err
  }
}

/**
 * 扣除积分
 */
async function deductPoints(childId, points, extra = {}) {
  if (!childId) {
    return {
      success: false,
      message: '孩子ID不能为空'
    }
  }

  try {
    console.log('开始扣除积分:', {
      childId,
      points,
      extra,
      time: new Date().toISOString()
    })

    // 在 point_records 集合中创建扣除记录
    const recordData = {
      childId,
      points: Math.abs(points),
      type: 'penalty',  // 扣除积分使用 penalty 类型
      description: extra.description || '',  // 添加描述
      ruleId: extra.ruleId || '',  // 关联规则ID
      ruleName: extra.ruleName || '',  // 关联规则名称
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      isDeleted: false
    }

    const result = await db.collection('point_records').add({
      data: recordData
    })

    console.log('积分扣除完成:', {
      childId,
      points,
      recordId: result._id,
      time: new Date().toISOString()
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('扣除积分失败:', {
      childId,
      points,
      error: err,
      time: new Date().toISOString()
    })
    throw err
  }
}

/**
 * 检查孩子是否已存在
 */
async function checkChildExists(name, birthday, gender) {
  try {
    const { total } = await db.collection('children')
      .where({
        name,
        birthday,
        gender,
        isDeleted: _.neq(true)
      })
      .count()
    
    return {
      success: true,
      exists: total > 0
    }
  } catch (err) {
    console.error('检查孩子是否存在失败:', err)
    throw err
  }
}

/**
 * 添加孩子
 */
async function addChild(data) {
  try {
    const db = wx.cloud.database()
    
    // 检查是否已存在
    const { exists } = await checkChildExists(data.name, data.birthday, data.gender)
    if (exists) {
      return {
        success: false,
        error: 'CHILD_EXISTS',
        message: '该孩子已存在'
      }
    }

    // 添加孩子到 children 集合
    const { _id } = await db.collection('children').add({
      data: {
        ...data,
        points: 0,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    })

    return {
      success: true,
      data: { _id }
    }
  } catch (err) {
    console.error('添加孩子失败:', err)
    throw err
  }
}

/**
 * 更新孩子信息
 */
async function updateChild(id, childData) {
  try {
    // 如果要更新姓名或生日，需要检查是否与其他孩子冲突
    if (childData.name || childData.birthday) {
      const child = await db.collection('children').doc(id).get()
      const name = childData.name || child.data.name
      const birthday = childData.birthday || child.data.birthday
      
      // 检查是否与其他孩子冲突
      const { total } = await db.collection('children')
        .where({
          _id: _.neq(id),
          name,
          birthday,
          isDeleted: _.neq(true)
        })
        .count()
      
      if (total > 0) {
        return {
          success: false,
          error: 'CHILD_EXISTS',
          message: '该孩子信息已存在'
        }
      }
    }

    // 更新孩子信息
    await db.collection('children').doc(id).update({
      data: {
        ...childData,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新孩子信息失败:', err)
    throw err
  }
}

/**
 * 格式化生日
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串 YYYY-MM-DD
 */
function formatBirthday(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取孩子的家人列表
 */
async function getChildFamily(childId) {
  try {
    // 获取关系记录
    const { data: relations } = await db.collection('relations')
      .where({
        childId,
        isDeleted: _.neq(true)
      })
      .get()

    if (!relations.length) {
      return {
        success: true,
        data: []
      }
    }

    // 获取家人信息
    const memberIds = relations.map(r => r.memberId)
    const { data: members } = await db.collection('family_members')
      .where({
        _id: _.in(memberIds),
        isDeleted: _.neq(true)
      })
      .get()

    // 合并关系和家人信息
    const familyList = relations.map(relation => {
      const member = members.find(m => m._id === relation.memberId)
      if (!member) return null
      return {
        _id: relation._id,        // 关系ID
        memberId: member._id,     // 成员ID
        name: member.name,
        role: relation.role
      }
    }).filter(Boolean)

    return {
      success: true,
      data: familyList
    }
  } catch (err) {
    console.error('获取家人列表失败:', err)
    throw err
  }
}

/**
 * 添加家人关系
 */
async function addFamilyRelation(childId, memberId, role) {
  try {
    // 检查是否已存在关系
    const { total } = await db.collection('relations')
      .where({
        childId,
        memberId,
        isDeleted: _.neq(true)
      })
      .count()

    if (total > 0) {
      return {
        success: false,
        error: 'RELATION_EXISTS',
        message: '关系已存在'
      }
    }

    // 添加关系
    const { _id } = await db.collection('relations').add({
      data: {
        childId,
        memberId,
        role,
        permissions: ['view'],
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    })

    return {
      success: true,
      id: _id
    }
  } catch (err) {
    console.error('添加关系失败:', err)
    throw err
  }
}

/**
 * 更新家人关系
 */
async function updateFamilyRelation(relationId, data) {
  try {
    await db.collection('relations')
      .doc(relationId)
      .update({
        data: {
          ...data,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新关系失败:', err)
    throw err
  }
}

/**
 * 删除家人关系
 */
async function deleteFamilyRelation(relationId) {
  if (!relationId) {
    throw new Error('relationId must not be empty')
  }
  
  try {
    await db.collection('relations')
      .doc(relationId)
      .update({
        data: {
          isDeleted: true,
          deleteTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('删除关系失败:', err)
    throw err
  }
}

/**
 * 获取孩子详情
 */
async function getChildDetail(childId) {
  try {
    const { data } = await db.collection('children')
      .doc(childId)
      .field({
        _id: true,
        name: true,
        avatar: true,
        points: true,
        birthday: true,
        gender: true
      })
      .get()

    // 计算年龄
    if (data.birthday) {
      const birthDate = new Date(data.birthday)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12
      data.age = `${age}岁${months}个月`
    }
    
    return data
  } catch (err) {
    console.error('获取孩子详情失败:', err)
    throw err
  }
}

/**
 * 获取家人详情
 */
async function getFamilyDetail(relationId) {
  try {
    const { data: relation } = await db.collection('relations')
      .doc(relationId)
      .get()

    if (!relation) {
      throw new Error('关系不存在')
    }

    const { data: member } = await db.collection('family_members')
      .doc(relation.memberId)
      .get()

    return {
      success: true,
      data: {
        ...member,
        role: relation.role,
        permissions: relation.permissions
      }
    }
  } catch (err) {
    console.error('获取家人详情失败:', err)
    throw err
  }
}

module.exports = {
  getCurrentChild,
  setCurrentChild,
  getChildList,
  getChildPoints,
  deductPoints,
  addPoints,
  addChild,
  updateChild,
  checkChildExists,
  formatBirthday,
  getChildFamily,
  addFamilyRelation,
  updateFamilyRelation,
  deleteFamilyRelation,
  getChildDetail,
  getFamilyDetail
} 