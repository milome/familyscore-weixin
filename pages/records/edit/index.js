Page({
  data: {
    id: '',
    form: {
      memberId: '',
      ruleId: '',
      type: 'reward',
      points: 0,
      remark: ''
    },
    members: [],
    rules: [],
    memberIndex: -1,
    ruleIndex: -1,
    submitting: false,
    showDeleteModal: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadRecord(options.id)
    }
    this.loadMembers()
    this.loadRules()
  },

  async loadRecord(id) {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('point_records').doc(id).get()
      
      this.setData({
        form: {
          memberId: data.memberId,
          ruleId: data.ruleId,
          type: data.type,
          points: data.points,
          remark: data.remark || ''
        }
      })

      // 设置选中的成员和规则索引
      this.setSelectedIndexes()
    } catch (err) {
      console.error('加载记录失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  async loadMembers() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('family_members')
        .where({ isDeleted: false })
        .orderBy('createTime', 'desc')
        .get()

      this.setData({ members: data })
      this.setSelectedIndexes()
    } catch (err) {
      console.error('加载成员失败:', err)
    }
  },

  async loadRules() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('point_rules')
        .where({ isDeleted: false })
        .orderBy('createTime', 'desc')
        .get()

      this.setData({ rules: data })
      this.setSelectedIndexes()
    } catch (err) {
      console.error('加载规则失败:', err)
    }
  },

  setSelectedIndexes() {
    if (this.data.form.memberId && this.data.members.length) {
      const memberIndex = this.data.members.findIndex(m => m._id === this.data.form.memberId)
      if (memberIndex !== -1) {
        this.setData({ memberIndex })
      }
    }

    if (this.data.form.ruleId && this.data.rules.length) {
      const ruleIndex = this.data.rules.findIndex(r => r._id === this.data.form.ruleId)
      if (ruleIndex !== -1) {
        this.setData({ ruleIndex })
      }
    }
  },

  onMemberChange(e) {
    const index = e.detail.value
    const member = this.data.members[index]
    this.setData({
      memberIndex: index,
      'form.memberId': member._id
    })
  },

  onRuleChange(e) {
    const index = e.detail.value
    const rule = this.data.rules[index]
    this.setData({
      ruleIndex: index,
      'form.ruleId': rule._id,
      'form.type': rule.type,
      'form.points': rule.points
    })
  },

  async handleSubmit(e) {
    const { remark } = e.detail.value
    if (!this.data.form.memberId) {
      return wx.showToast({
        title: '请选择成员',
        icon: 'none'
      })
    }
    if (!this.data.form.ruleId) {
      return wx.showToast({
        title: '请选择规则',
        icon: 'none'
      })
    }

    this.setData({ submitting: true })
    try {
      const db = wx.cloud.database()
      const member = this.data.members[this.data.memberIndex]
      const rule = this.data.rules[this.data.ruleIndex]
      
      const data = {
        memberId: this.data.form.memberId,
        memberName: member.name,
        memberAvatar: member.avatarUrl,
        ruleId: this.data.form.ruleId,
        ruleName: rule.name,
        type: this.data.form.type,
        points: this.data.form.points,
        remark,
        updateTime: db.serverDate()
      }

      if (this.data.id) {
        await db.collection('point_records').doc(this.data.id).update({
          data
        })
      } else {
        data.createTime = db.serverDate()
        data.isDeleted = false
        await db.collection('point_records').add({
          data
        })

        // 更新规则使用次数
        await db.collection('point_rules').doc(rule._id).update({
          data: {
            usageCount: db.command.inc(1)
          }
        })
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  showDeleteConfirm() {
    this.setData({ showDeleteModal: true })
  },

  hideDeleteModal() {
    this.setData({ showDeleteModal: false })
  },

  async handleDelete() {
    try {
      const db = wx.cloud.database()
      await db.collection('point_records').doc(this.data.id).update({
        data: {
          isDeleted: true,
          deleteTime: db.serverDate()
        }
      })

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
}) 