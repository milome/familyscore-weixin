const db = wx.cloud.database()
const collection = db.collection('scratch_cards')

/**
 * 获取刮刮卡列表
 */
async function getCardList() {
  try {
    const { data } = await collection
      .where({
        status: 'active',
        isDeleted: false
      })
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取刮刮卡列表失败:', err)
    throw err
  }
}

/**
 * 获取刮刮卡详情
 */
async function getCardDetail(id) {
  try {
    console.log('获取刮刮卡详情:', id)

    const { data } = await collection.doc(id).get()

    console.log('获取到的刮刮卡数据:', data)

    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('获取详情失败:', err)
    throw err
  }
}

/**
 * 创建刮刮卡
 */
async function createCard(cardData) {
  try {
    const { _id } = await collection.add({
      data: {
        ...cardData,
        status: 'active',
        isDeleted: false,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return {
      success: true,
      _id
    }
  } catch (err) {
    console.error('创建刮刮卡失败:', err)
    throw err
  }
}

/**
 * 更新刮刮卡
 */
async function updateCard(id, data) {
  try {
    console.log('开始更新刮刮卡:', { id, data })

    const result = await collection
      .doc(id)
      .update({
        data: {
          title: data.title,
          description: data.description,
          points: parseInt(data.points),
          status: 'active',
          updateTime: db.serverDate()
        }
      })

    console.log('更新刮刮卡结果:', result)

    const updated = await collection.doc(id).get()
    console.log('更新后的数据:', updated.data)

    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error('更新刮刮卡失败:', err)
    console.error('错误详情:', {
      id,
      data,
      error: err
    })
    throw err
  }
}

/**
 * 删除刮刮卡
 */
async function deleteCard(id) {
  try {
    await collection.doc(id).update({
      data: {
        isDeleted: true,
        deleteTime: db.serverDate()
      }
    })
    return {
      success: true
    }
  } catch (err) {
    console.error('删除刮刮卡失败:', err)
    throw err
  }
}

/**
 * 获取用户积分
 */
async function getUserPoints() {
  try {
    const { data: [user] } = await db.collection('users')
      .where({
        _openid: wx.getStorageSync('openid')
      })
      .get()
    
    return {
      success: true,
      points: user ? user.points || 0 : 0
    }
  } catch (err) {
    console.error('获取用户积分失败:', err)
    throw err
  }
}

/**
 * 开始游戏
 */
async function play(cardId) {
  try {
    // 模拟请求
    await new Promise(resolve => setTimeout(resolve, 100))

    // 直接返回中奖结果
    return {
      success: true,
      hasWon: true  // 设置为 true 表示必中奖
    }
  } catch (err) {
    console.error('游戏失败:', err)
    throw err
  }
}

/**
 * 领取奖励
 */
async function claimPrize(cardId) {
  try {
    // 模拟请求
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      success: true
    }
  } catch (err) {
    console.error('领取失败:', err)
    throw err
  }
}

/**
 * 获取随机匹配的刮刮卡
 */
async function getRandomCard(points) {
  try {
    const { data } = await collection
      .where({
        status: 'active',
        isDeleted: false,
        points: points  // 匹配积分数量
      })
      .get()

    if (!data || data.length === 0) {
      return {
        success: true,
        data: null
      }
    }

    // 随机选择一张卡
    const randomIndex = Math.floor(Math.random() * data.length)
    return {
      success: true,
      data: data[randomIndex]
    }
  } catch (err) {
    console.error('获取随机刮刮卡失败:', err)
    throw err
  }
}

module.exports = {
  getCardList,
  getCardDetail,
  createCard,
  updateCard,
  deleteCard,
  getUserPoints,
  play,
  claimPrize,
  getRandomCard
} 