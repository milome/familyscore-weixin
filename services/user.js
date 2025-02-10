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
          isDeleted: false
        })
        .orderBy('createTime', 'desc')
        .limit(1)
        .get()

      if (data && data.length > 0) {
        // 找到第一个孩子，设置为当前选中
        const child = data[0]
        console.log('getCurrentChild - 第一个孩子:', {
          id: child._id,
          name: child.name,
          avatar: child.avatar
        })
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
      
      // 处理头像URL
      if (data.avatar && data.avatar.startsWith('cloud://')) {
        try {
          const { fileList } = await wx.cloud.getTempFileURL({
            fileList: [data.avatar]
          })
          console.log('头像临时URL转换:', {
            原始fileID: data.avatar,
            临时URL: fileList[0].tempFileURL,
            状态: fileList[0].status,
            错误信息: fileList[0].errMsg
          })
          data.avatar = fileList[0].tempFileURL
        } catch (err) {
          console.error('获取头像临时链接失败:', err)
        }
      }

      console.log('getCurrentChild - 获取指定孩子:', {
        id: data._id,
        name: data.name,
        avatar: data.avatar,
        avatarType: typeof data.avatar,
        avatarLength: data.avatar?.length
      })
      return data
    } catch (err) {
      console.error('获取指定孩子失败，尝试获取第一个孩子:', err)
      
      // 如果获取指定ID的孩子失败，尝试获取第一个孩子
      const { data } = await db.collection('children')
        .where({
          isDeleted: false
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
        isDeleted: false
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
    
    // 处理头像URL
    const processedData = await Promise.all(data.map(async (child) => {
      if (child.avatar && child.avatar.startsWith('cloud://')) {
        try {
          const { fileList } = await wx.cloud.getTempFileURL({
            fileList: [child.avatar]
          })
          console.log('列表头像临时URL转换:', {
            childId: child._id,
            childName: child.name,
            原始fileID: child.avatar,
            临时URL: fileList[0].tempFileURL,
            状态: fileList[0].status,
            错误信息: fileList[0].errMsg
          })
          return {
            ...child,
            avatar: fileList[0].tempFileURL
          }
        } catch (err) {
          console.error('获取头像临时链接失败:', {
            childId: child._id,
            childName: child.name,
            原始fileID: child.avatar,
            错误: err
          })
          return child
        }
      }
      return child
    }))
    
    return {
      success: true,
      data: processedData
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
  try {
    const db = wx.cloud.database()
    const _ = db.command
    
    // 先获取总记录数
    const { total } = await db.collection('point_records')
      .where({
        childId,
        isDeleted: false
      })
      .count()
    
    // 分批获取所有记录
    const batchSize = 20  // 微信小程序单次查询限制
    const batchTimes = Math.ceil(total / batchSize)
    const tasks = []
    
    console.log('开始分页获取积分记录:', {
      total,
      batchSize,
      batchTimes,
      time: new Date().toISOString()
    })
    
    for (let i = 0; i < batchTimes; i++) {
      console.log(`准备获取第 ${i + 1}/${batchTimes} 批记录`)
      const promise = db.collection('point_records')
        .where({
          childId,
          isDeleted: false
        })
        .skip(i * batchSize)
        .limit(batchSize)
        .get()
      tasks.push(promise)
    }

    // 等待所有请求完成
    const results = await Promise.all(tasks)
    console.log('获取到的批次数:', results.length)
    results.forEach((result, index) => {
      console.log(`第 ${index + 1} 批记录:`, {
        count: result.data.length,
        records: result.data.map(r => ({
          points: r.points,
          type: r.type,
          description: r.description
        }))
      })
    })
    
    // 合并所有批次的记录
    const records = results.reduce((acc, cur) => [...acc, ...cur.data], [])
    
    // 获取完所有记录后再排序
    records.sort((a, b) => b.createTime - a.createTime)
    
    console.log('获取到的积分记录:', {
      childId,
      recordCount: records.length,
      total,
      batchTimes,
      records: records.map(r => ({
        points: r.points,
        type: r.type,
        description: r.description,
        createTime: r.createTime
      }))
    })
    
    // 计算总积分
    let rewardPoints = 0
    let penaltyPoints = 0
    
    records.forEach(record => {
      if (record.type === 'reward') {
        rewardPoints += record.points
      } else if (record.type === 'penalty') {
        penaltyPoints += record.points
      }
    })
    
    const points = rewardPoints - penaltyPoints
    
    console.log('积分计算详情:', {
      childId,
      points,
      rewardPoints,
      penaltyPoints,
      time: new Date().toISOString()
    })
    
    console.log('积分记录详情:', {
      childId,
      records,
      time: new Date().toISOString()
    })
    
    return {
      points,
      rewardPoints,
      penaltyPoints
    }
  } catch (err) {
    console.error('获取积分失败:', err)
    throw err
  }
}

/**
 * 增加积分
 */
async function addPoints(childId, points, extra = {}) {
  if (!childId) {
    return {
      success: false,
      message: '孩子ID不能为空'
    }
  }

  try {
    console.log('开始处理积分:', {
      childId,
      points,
      type: points >= 0 ? 'reward' : 'penalty',
      extra,
      time: new Date().toISOString()
    })

    // 创建积分记录
    const db = wx.cloud.database()
    const _ = db.command
    await db.collection('point_records').add({
      data: {
        childId,
        points: Math.abs(points),
        type: points >= 0 ? 'reward' : 'penalty',
        description: extra.description || '',
        ruleName: extra.ruleName || '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    })

    // 更新孩子积分
    await db.collection('children')
      .doc(childId)
      .update({
        data: {
          points: _.inc(points),
          updateTime: db.serverDate()
        }
      })

    console.log('积分记录完成:', {
      childId,
      points,
      type: points >= 0 ? 'reward' : 'penalty',
      time: new Date().toISOString()
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('处理积分失败:', {
      error: err,
      childId,
      points,
      extra,
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

    const db = wx.cloud.database()
    const _ = db.command

    // 确保扣除的是正数
    const pointsToDeduct = Math.abs(points)

    // 创建积分记录
    await db.collection('point_records').add({
      data: {
        childId,
        points: pointsToDeduct,
        type: 'penalty',
        description: extra.description || '',
        ruleName: extra.ruleName || '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    })

    // 更新孩子积分
    await db.collection('children')
      .doc(childId)
      .update({
        data: {
          points: _.inc(-pointsToDeduct),  // 扣除积分
          updateTime: db.serverDate()
        }
      })

    console.log('积分扣除完成:', {
      childId,
      deductedPoints: pointsToDeduct,
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
        isDeleted: false
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
async function updateChild(id, data) {
  try {
    // 检查id是否存在
    if (!id) {
      throw new Error('Missing child id')
    }

    // 构建更新数据
    const updateData = {
      ...data,
      updateTime: db.serverDate()
    }

    // 如果有新头像，先上传
    if (data.avatar && data.avatar.startsWith('wxfile://')) {
      const fileID = await uploadFile(data.avatar)
      updateData.avatar = fileID
    }

    // 更新数据库
    await db.collection('children').doc(id).update({
      data: updateData
    })

    // 获取更新后的完整数据
    const { data: updatedChild } = await db.collection('children')
      .doc(id)
      .get()

    return updatedChild

  } catch (err) {
    console.error('更新孩子信息失败:', err)
    throw err
  }
}

// 上传文件
async function uploadFile(filePath) {
  try {
    const { fileID } = await wx.cloud.uploadFile({
      cloudPath: `children/avatar/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
      filePath: filePath
    })
    return fileID
  } catch (err) {
    console.error('上传文件失败:', err)
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
        isDeleted: false
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
        isDeleted: false
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
        isDeleted: false
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