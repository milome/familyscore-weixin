const db = wx.cloud.database()
const collection = db.collection('family_members')

/**
 * 获取成员列表
 * @param {string} keyword 搜索关键词
 * @returns {Promise<Array>}
 */
async function getMemberList(keyword = '') {
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
    
    console.log('成员列表数据:', data)

    // 处理成员关系
    const memberMap = data.reduce((map, member) => {
      map[member._id] = member
      return map
    }, {})

    return data.map(member => ({
      ...member,
      relations: (member.relations || []).map(rel => ({
        ...rel,
        memberName: memberMap[rel.memberId]?.name || '未知成员'
      }))
    }))
  } catch (err) {
    console.error('获取成员列表失败:', err)
    throw err
  }
}

/**
 * 添加成员
 * @param {Object} member 成员信息
 * @returns {Promise<Object>}
 */
async function addMember(member) {
  try {
    const data = {
      name: member.name,
      avatar: member.avatar || '/images/default-avatar.png',
      role: member.role || 'child', // 角色: father-爸爸, mother-妈妈, child-孩子
      gender: member.gender || 'male', // 性别: male-男, female-女
      relations: member.relations || [], // 成员关系: [{memberId, relation}] relation: parent-家长, child-子女
      points: 0,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      isDeleted: false
    }
    const res = await collection.add({ data })
    return {
      _id: res._id,
      ...data
    }
  } catch (err) {
    console.error('添加成员失败:', err)
    throw err
  }
}

/**
 * 更新成员
 * @param {string} id 成员ID
 * @param {Object} data 更新数据
 * @returns {Promise<Object>}
 */
async function updateMember(id, data) {
  try {
    const updateData = {
      ...data,
      // 防止直接修改这些字段
      points: undefined,
      createTime: undefined,
      isDeleted: undefined,
      updateTime: db.serverDate()
    }
    return await collection.doc(id).update({
      data: updateData
    })
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
 */
async function getMember(id) {
  try {
    const { data } = await collection.doc(id).get()
    if (data.relations) {
      // 获取关联成员信息
      const memberIds = data.relations.map(rel => rel.memberId)
      const { data: relatedMembers } = await collection
        .where({
          _id: db.command.in(memberIds)
        })
        .get()

      const memberMap = relatedMembers.reduce((map, member) => {
        map[member._id] = member
        return map
      }, {})

      data.relations = data.relations.map(rel => ({
        ...rel,
        memberName: memberMap[rel.memberId]?.name || '未知成员'
      }))
    }
    return data
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
  addMember,
  updateMember,
  deleteMember,
  getMember,
  getMyChildren
} 