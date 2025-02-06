const { callFunction } = require('./cloud')

/**
 * 权限检查中间件
 */
async function checkAuth(pageInstance, roles = ['parent']) {
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'checkUserRole'
    })

    if (!result.success) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'error'
      })
      return false
    }

    const { role, isParent, isChild } = result.data

    if (!roles.includes(role)) {
      wx.showToast({
        title: '无访问权限',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return false
    }

    // 注入权限信息到页面实例
    pageInstance.setData({
      userRole: role,
      isParent,
      isChild
    })

    return true
  } catch (err) {
    console.error('权限检查失败:', err)
    wx.showToast({
      title: '系统错误',
      icon: 'error'
    })
    return false
  }
}

module.exports = {
  checkAuth
} 