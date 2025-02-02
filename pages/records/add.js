Page({
  data: {
    members: [],
    rules: [],
    selectedMember: null,
    selectedRule: null
  },

  onLoad: function() {
    this.loadMembers()
    this.loadRules()
  },

  loadMembers: function() {
    wx.cloud.database().collection('family_members')
      .get()
      .then(res => {
        this.setData({
          members: res.data
        })
      })
  },

  loadRules: function() {
    wx.cloud.database().collection('point_rules')
      .get()
      .then(res => {
        this.setData({
          rules: res.data
        })
      })
  },

  onMemberChange: function(e) {
    const index = e.detail.value
    this.setData({
      selectedMember: this.data.members[index]
    })
  },

  onRuleChange: function(e) {
    const index = e.detail.value
    this.setData({
      selectedRule: this.data.rules[index]
    })
  },

  submitForm: function() {
    if (!this.data.selectedMember) {
      wx.showToast({
        title: '请选择成员',
        icon: 'none'
      })
      return
    }

    if (!this.data.selectedRule) {
      wx.showToast({
        title: '请选择规则',
        icon: 'none'
      })
      return
    }

    const db = wx.cloud.database()
    // 添加积分记录
    db.collection('point_records').add({
      data: {
        memberId: this.data.selectedMember._id,
        memberName: this.data.selectedMember.name,
        memberAvatar: this.data.selectedMember.avatar,
        ruleId: this.data.selectedRule._id,
        ruleTitle: this.data.selectedRule.title,
        points: this.data.selectedRule.points,
        createTime: db.serverDate()
      }
    }).then(() => {
      // 更新成员积分
      return db.collection('family_members')
        .doc(this.data.selectedMember._id)
        .update({
          data: {
            points: db.command.inc(this.data.selectedRule.points)
          }
        })
    }).then(() => {
      wx.showToast({
        title: '添加成功'
      })
      wx.navigateBack()
    })
  }
}) 