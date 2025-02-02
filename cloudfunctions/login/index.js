const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { userInfo } = event

  try {
    // 查找用户是否已存在
    const { data } = await db.collection('users')
      .where({ openId: OPENID })
      .get()

    if (data.length === 0) {
      // 新用户，创建用户记录
      const { _id } = await db.collection('users').add({
        data: {
          openId: OPENID,
          ...userInfo,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
      return {
        success: true,
        userId: _id
      }
    } else {
      // 更新用户信息
      await db.collection('users').doc(data[0]._id).update({
        data: {
          ...userInfo,
          updateTime: db.serverDate()
        }
      })
      return {
        success: true,
        userId: data[0]._id
      }
    }
  } catch (err) {
    console.error('[登录失败]', err)
    return {
      success: false,
      message: '登录失败'
    }
  }
} 


