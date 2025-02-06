const cloud = require('wx-server-sdk')

cloud.init({
  env: 'familycore-weixin-0gyt6kmd69f9c60f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查找用户
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()
    
    // 如果用户存在，直接返回
    if (userRes.data && userRes.data.length > 0) {
      return {
        success: true,
        data: userRes.data[0]
      }
    }

    // 如果用户不存在，创建新用户（默认为家长角色）
    const userData = {
      openid: openid,
      role: 'parent',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addResult = await db.collection('users').add({
      data: userData
    })

    return {
      success: true,
      data: {
        ...userData,
        _id: addResult._id
      }
    }

  } catch (err) {
    console.error('[login]错误:', err)
    return {
      success: false,
      error: err
    }
  }
} 


