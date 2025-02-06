// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'familycore-weixin-0gyt6kmd69f9c60f'  // 使用硬编码的环境ID
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  console.log('开始检查用户角色:', {
    openid,
    context
  })

  try {
    // 检查users集合是否存在
    const collections = await db.listCollections().get()
    console.log('数据库集合列表:', collections)

    // 查询用户信息
    console.log('开始查询用户信息...')
    const userQuery = await db.collection('users')
      .where({ openid })
      .get()
    
    console.log('用户查询结果:', userQuery)

    if (userQuery.data && userQuery.data.length > 0) {
      const user = userQuery.data[0]
      console.log('找到用户:', user)
      return {
        success: true,
        data: {
          role: user.role || 'child',
          isParent: user.role === 'parent',
          isChild: user.role === 'child'
        }
      }
    }

    // 检查是否是第一个用户
    const totalUsers = await db.collection('users').count()
    const isFirstUser = totalUsers.total === 0

    // 创建新用户
    console.log('用户不存在,准备创建新用户...')
    const userData = {
      openid,
      role: isFirstUser ? 'parent' : 'child', // 第一个用户设为家长
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const addResult = await db.collection('users').add({
      data: userData
    })

    console.log('创建用户成功:', addResult)

    return {
      success: true,
      data: {
        role: userData.role,
        isParent: userData.role === 'parent',
        isChild: userData.role === 'child'
      }
    }

  } catch (err) {
    console.error('检查用户角色失败:', err)
    return {
      success: false,
      error: err.message || err.errMsg || '未知错误',
      detail: err
    }
  }
}