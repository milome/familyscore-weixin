Component({
  properties: {
    visible: Boolean,
    filter: {
      type: Object,
      value: {}
    }
  },

  data: {
    typeOptions: [
      { label: '全部', value: '' },
      { label: '奖励', value: 'reward' },
      { label: '惩罚', value: 'penalty' }
    ],
    members: []
  },

  lifetimes: {
    attached() {
      this.loadMembers()
    }
  },

  methods: {
    async loadMembers() {
      const db = wx.cloud.database()
      const res = await db.collection('family_members')
        .where({ isDeleted: false })
        .field({
          _id: true,
          name: true,
          avatar: true
        })
        .get()
      
      this.setData({ members: res.data })
    },

    onClose() {
      this.triggerEvent('close')
    },

    onDateRangeChange(e) {
      const { startDate, endDate } = e.detail
      this.updateFilter({ startDate, endDate })
    },

    onTypeSelect(e) {
      const type = e.currentTarget.dataset.type
      this.updateFilter({ type })
    },

    onMemberSelect(e) {
      const memberId = e.currentTarget.dataset.id
      this.updateFilter({ memberId })
    },

    updateFilter(data) {
      const filter = {
        ...this.data.filter,
        ...data
      }
      this.setData({ filter })
    },

    onReset() {
      this.setData({
        filter: {}
      })
    },

    onConfirm() {
      this.triggerEvent('confirm', { filter: this.data.filter })
      this.onClose()
    }
  },

  options: {
    addGlobalClass: true
  }
}) 