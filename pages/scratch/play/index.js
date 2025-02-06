// const { checkAuth } = require('../../../utils/auth')  // 注释掉权限检查引入
const scratchService = require('../../../services/scratch')
const { getCurrentChild, getChildPoints, deductPoints } = require('../../../services/user')

Page({
  data: {
    id: '',
    card: null,
    loading: true,
    hasWon: false,
    revealed: false,
    claiming: false,
    showPointsModal: false,
    isScratching: false,
    currentChild: null,  // 添加当前孩子信息
    childPoints: 0,  // 当前孩子的积分
    showExchangeModal: false,
    exchangePoints: '',
  },

  async onLoad(options) {
    if (!options.id) {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      return
    }

    try {
      this.setData({ loading: true })
      
      // 获取刮刮卡详情
      const db = wx.cloud.database()
      const { data: card } = await db.collection('scratch_cards')
        .doc(options.id)
        .get()
      
      if (!card) {
        wx.showToast({
          title: '刮刮卡不存在',
          icon: 'error'
        })
        return
      }

      this.setData({
        id: options.id,
        card,
        loading: false
      })

      // 加载孩子信息和积分
      await this.loadData()
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  // 开始刮卡
  startScratch() {
    // 防止重复点击
    if (this.data.revealed || this.data.isScratching) return
    
    this.setData({ isScratching: true })
    
    // 添加震动反馈
    wx.vibrateShort({
      type: 'light',
      complete: () => {
        setTimeout(() => {
          this.showResult()
        }, 500)
      }
    })
  },

  // 显示结果
  async showResult() {
    if (this.data.revealed) return

    try {
      const response = await scratchService.play(this.data.id)
      console.log('游戏结果:', response)  // 添加日志
      
      const { hasWon } = response
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      this.setData({
        hasWon,
        revealed: true,
        isScratching: false
      })

      if (hasWon) {
        // 中奖时添加额外震动反馈
        wx.vibrateShort({ type: 'medium' })
      }

    } catch (err) {
      console.error('游戏失败:', err)
      wx.showToast({
        title: '游戏失败',
        icon: 'error'
      })
      this.setData({ 
        isScratching: false,
        revealed: true  // 出错时也显示结果
      })
    }
  },

  // 修改领取奖励方法
  async claimPoints() {
    if (this.data.claiming) return
    console.log('开始领取奖励:', {
      childId: this.data.currentChild._id,
      childName: this.data.currentChild.name,
      points: this.data.card.points,
      cardTitle: this.data.card.title
    })
    
    this.setData({ claiming: true })

    try {
      // 使用 deductPoints 方法扣除积分
      console.log('准备扣除积分')
      await deductPoints(this.data.currentChild._id, -this.data.card.points, {
        description: `兑换${this.data.card.title}`,
        ruleName: '兑换奖励'  // 使用虚拟规则名
      })
      console.log('积分扣除完成')

      // 重新获取最新积分
      const { points: newPoints } = await getChildPoints(this.data.currentChild._id)
      console.log('更新后的积分:', newPoints)

      this.setData({
        childPoints: newPoints
      })

      wx.showToast({
        title: '领取成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (err) {
      console.error('领取失败:', err)
      console.error('错误详情:', {
        childId: this.data.currentChild._id,
        points: this.data.card.points,
        error: err
      })
      wx.showToast({
        title: '领取失败',
        icon: 'error'
      })
    } finally {
      this.setData({ claiming: false })
    }
  },

  hidePointsModal() {
    this.setData({ showPointsModal: false })
    wx.navigateBack()
  },

  goToTasks() {
    this.setData({ showPointsModal: false })
    wx.switchTab({
      url: '/pages/records/list/index'
    })
  },

  // 显示兑换积分弹窗
  showExchangeModal() {
    this.setData({
      showExchangeModal: true,
      exchangePoints: ''  // 清空输入
    })
  },

  // 关闭兑换积分弹窗
  hideExchangeModal() {
    this.setData({
      showExchangeModal: false
    })
  },

  // 处理积分输入
  onExchangeInput(e) {
    this.setData({
      exchangePoints: e.detail.value
    })
  },

  // 处理积分兑换
  async handleExchange() {
    try {
      // 重新获取当前孩子和最新积分
      const child = await getCurrentChild()
      if (!child) {
        wx.showToast({
          title: '请先选择孩子',
          icon: 'none'
        })
        return
      }

      const { points: latestPoints } = await getChildPoints(child._id)
      console.log('兑换前获取到的最新积分:', { childId: child._id, points: latestPoints }) // 添加日志

      const exchangePoints = parseInt(this.data.exchangePoints)
      if (!exchangePoints || exchangePoints <= 0) {
        wx.showToast({
          title: '请输入有效的积分数量',
          icon: 'none'
        })
        return
      }

      if (exchangePoints > latestPoints) {
        wx.showToast({
          title: '积分不足',
          icon: 'none'
        })
        return
      }

      this.setData({ loading: true })
      
      // 扣除积分
      await deductPoints(child._id, exchangePoints)

      // 重新获取最新积分
      const { points: newPoints } = await getChildPoints(child._id)
      
      this.setData({
        currentChild: child,
        childPoints: newPoints,
        showExchangeModal: false,
        loading: false
      })

      wx.showToast({
        title: '兑换成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('兑换失败:', err)
      wx.showToast({
        title: '兑换失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      // 获取当前孩子
      const child = await getCurrentChild()
      console.log('刮刮卡页面获取到的孩子:', child) // 添加日志
      
      if (!child) {
        wx.showToast({
          title: '请先添加孩子',
          icon: 'none'
        })
        return
      }

      // 获取孩子积分
      const { points } = await getChildPoints(child._id)
      console.log('刮刮卡页面获取到的积分:', { childId: child._id, points }) // 添加日志

      this.setData({
        currentChild: child,
        childPoints: points,
        loading: false
      })
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  showPointsModal() {
    wx.showModal({
      title: '恭喜中奖',
      content: `获得${this.data.card.points}积分`,
      showCancel: false,
      confirmText: '立即领取',
      success: async (res) => {
        if (res.confirm) {
          await this.claimPoints()
        }
      }
    })
  },
}) 