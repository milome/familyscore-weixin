const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const db = cloud.database()
  const { OPENID } = cloud.getWXContext()
  const { code } = event

  try {
    // 查询邀请码
    const { data: [invite] } = await db.collection('invites')
      .where({
        code,
        isUsed: false
      })
      .get()

    if (!invite) {
      return {
        success: false,
        error: '邀请码无效或已使用'
      }
    }

    // 更新邀请码状态
    await db.collection('invites').doc(invite._id).update({
      data: {
        isUsed: true,
        usedBy: OPENID,
        useTime: db.serverDate()
      }
    })

    // 创建家庭关系
    await db.collection('family_members').add({
      data: {
        _openid: OPENID,
        createdBy: invite.createdBy,
        createTime: db.serverDate(),
        isDeleted: false
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 