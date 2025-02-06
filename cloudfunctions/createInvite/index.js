// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const collection = db.collection('invites')

/**
 * 邀请码集合结构:
 * {
 *   _id: String,      // 记录ID
 *   code: String,     // 6位邀请码
 *   createdBy: String,// 创建者openid
 *   createTime: Date, // 创建时间
 *   isUsed: Boolean,  // 是否已使用
 *   usedBy: String,   // 使用者openid
 *   useTime: Date     // 使用时间
 * }
 */

// 生成6位随机邀请码
function generateInviteCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    // 生成邀请码
    const code = generateInviteCode()
    
    // 创建邀请记录
    const result = await collection.add({
      data: {
        code,
        createdBy: OPENID,
        createTime: db.serverDate(),
        isUsed: false,
        usedBy: '',
        useTime: null
      }
    })

    return {
      success: true,
      code
    }
  } catch (err) {
    console.error('创建邀请码失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 