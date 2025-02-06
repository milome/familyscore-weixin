const db = wx.cloud.database()
const collection = db.collection('family_members')
const _ = db.command

/**
 * 获取成员列表
 */
async function getMemberList(type = 'all') {
  try {
    const openid = wx.getStorageSync('openid')
    let query = { isDeleted: false }
    
    // 根据类型筛选
    if (type === 'children') {
      query = {
        isDeleted: false,
        role: 'child',
        createdBy: openid  // 只显示当前用户创建的孩子
      }
    } else if (type === 'family') {
      query = {
        isDeleted: false,
        role: db.command.in(['father', 'mother']),
        _openid: openid  // 只显示当前用户的家人身份
      }
    }

    const { data } = await collection
      .where(query)
      .orderBy('createTime', 'desc')
      .get()

    // 如果是获取孩子列表，需要附加积分信息
    if (type === 'children') {
      const pointsData = await getChildrenPoints(data.map(child => child._id))
      return data.map(child => ({
        ...child,
        points: pointsData[child._id] || 0
      }))
    }

    return data
  } catch (err) {
    console.error('获取成员列表失败:', err)
    throw err
  }
}

/**
 * 获取孩子们的积分
 */
async function getChildrenPoints(childrenIds) {
  try {
    const db = wx.cloud.database()
    const $ = db.command.aggregate
    const { list } = await db.collection('point_records')
      .aggregate()
      .match({
        isDeleted: false,
        memberId: db.command.in(childrenIds)
      })
      .group({
        _id: '$memberId',
        totalPoints: $.sum($.cond({
          if: $.eq(['$type', 'reward']),
          then: '$points',
          else: $.multiply(['$points', -1])
        }))
      })
      .end()
    
    // 转换为 {memberId: points} 格式
    return list.reduce((acc, cur) => {
      acc[cur._id] = cur.totalPoints
      return acc
    }, {})
  } catch (err) {
    console.error('获取孩子积分失败:', err)
    return {}
  }
}

/**
 * 生成邀请码
 */
async function createInvite() {
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'createInvite'
    })
    return result
  } catch (err) {
    console.error('生成邀请码失败:', err)
    throw err
  }
}

/**
 * 通过邀请码加入家庭
 */
async function joinFamily(code) {
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'joinFamily',
      data: { code }
    })
    return result
  } catch (err) {
    console.error('加入家庭失败:', err)
    throw err
  }
}

/**
 * 添加成员
 * @param {string} type 成员类型 'family'|'child'
 * @param {object} data 成员数据
 */
async function addMember(type, data) {
  try {
    // 检查是否已存在
    const { total } = await db.collection(`${type}_members`)
      .where({
        name: data.name,
        isDeleted: _.neq(true)
      })
      .count()

    if (total > 0) {
      return {
        success: false,
        error: 'MEMBER_EXISTS',
        message: '该成员已存在'
      }
    }

    // 添加成员
    const { _id } = await db.collection(`${type}_members`).add({
      data: {
        ...data,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isDeleted: false
      }
    })

    return {
      success: true,
      data: {
        _id
      }
    }
  } catch (err) {
    console.error('添加成员失败:', err)
    throw err
  }
}

/**
 * 更新成员
 * @param {string} type 成员类型 'family'|'child'
 * @param {string} id 成员ID
 * @param {object} data 更新数据
 */
async function updateMember(type, id, data) {
  try {
    await db.collection(`${type}_members`)
      .doc(id)
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
    console.error('更新成员失败:', err)
    throw err
  }
}

/**
 * 删除成员
 * @param {string} id 成员ID
 * @param {boolean} physical 是否物理删除
 * @returns {Promise<Object>}
 */
async function deleteMember(id, physical = false) {
  if (physical) {
    return await collection.doc(id).remove()
  }
  return await collection.doc(id).update({
    data: {
      isDeleted: true,
      deleteTime: db.serverDate()
    }
  })
}

/**
 * 获取成员详情
 * @param {string} type 成员类型 'family'|'child'
 * @param {string} id 成员ID
 */
async function getMemberDetail(type, id) {
  try {
    const { data } = await db.collection(`${type}_members`)
      .doc(id)
      .get()

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取成员详情失败:', err)
    throw err
  }
}

/**
 * 获取当前用户的孩子列表
 */
async function getMyChildren() {
  try {
    // 先获取当前用户
    const { data: [currentUser] } = await collection
      .where({
        _openid: wx.getStorageSync('openid'),
        isDeleted: false
      })
      .get()

    if (!currentUser) {
      throw new Error('未找到当前用户')
    }

    // 获取所有与当前用户有关系的成员
    const { data: members } = await collection
      .where({
        isDeleted: false,
        'relations.memberId': currentUser._id,
        'relations.relation': 'parent' // 当前用户是这些成员的家长
      })
      .get()

    return members
  } catch (err) {
    console.error('获取孩子列表失败:', err)
    throw err
  }
}

module.exports = {
  getMemberList,
  createInvite,
  joinFamily,
  addMember,
  updateMember,
  deleteMember,
  getMemberDetail,
  getMyChildren
} 