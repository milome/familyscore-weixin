// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const collection = db.collection('scratchCards')

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, status, stock } = event

  try {
    const card = await collection.doc(id).get()
    if (!card.data) {
      return {
        success: false,
        error: '刮刮卡不存在'
      }
    }

    // 只允许创建者修改
    if (card.data.createdBy !== OPENID) {
      return {
        success: false,
        error: '无权限修改'
      }
    }

    const updateData = {
      updateTime: db.serverDate()
    }

    if (status) {
      updateData.status = status
    }

    if (typeof stock === 'number') {
      updateData.stock = stock
    }

    await collection.doc(id).update({
      data: updateData
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新刮刮卡失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 