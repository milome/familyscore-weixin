const db = wx.cloud.database()
const collection = db.collection('family_members')

/**
 * 获取成员列表
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
    return data
  } catch (err) {
    console.error('获取成员列表失败:', err)
    throw err
  }
}

/**
 * 删除成员
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

module.exports = {
  getMemberList,
  deleteMember
} 