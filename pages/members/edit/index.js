Page({
  data: {
    id: '',
    form: {
      name: '',
      remark: '',
      avatarUrl: '',
      role: '',
      gender: '',
      relations: []
    },
    roles: [
      { value: 'father', label: '爸爸' },
      { value: 'mother', label: '妈妈' },
      { value: 'child', label: '孩子' }
    ],
    relationTypes: [
      { value: 'parent', label: '家长' },
      { value: 'child', label: '子女' }
    ],
    genders: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' }
    ],
    members: [],
    roleIndex: -1,
    genderIndex: -1,
    submitting: false,
    showDeleteModal: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadMember(options.id)
    } else {
      this.setData({
        'form.role': 'child',
        'form.gender': 'male',
        roleIndex: 2,
        genderIndex: 0
      })
    }
    this.loadMembers()
  },

  async loadMember(id) {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('family_members').doc(id).get()
      
      this.setData({
        form: {
          name: data.name,
          remark: data.remark || '',
          avatarUrl: data.avatarUrl || '',
          role: data.role || 'child',
          gender: data.gender || 'male',
          relations: data.relations || []
        }
      })
    } catch (err) {
      console.error('加载成员信息失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  async loadMembers() {
    try {
      const members = await getMemberList()
      this.setData({ members })
    } catch (err) {
      console.error('加载成员列表失败:', err)
    }
  },

  async chooseAvatar() {
    try {
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed']
      })

      const filePath = tempFilePaths[0]
      const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(-6)}.${filePath.match(/\.(\w+)$/)[1]}`

      wx.showLoading({ title: '上传中...' })
      const { fileID } = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })

      this.setData({
        'form.avatarUrl': fileID
      })
    } catch (err) {
      console.error('上传头像失败:', err)
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  async handleSubmit(e) {
    const { name, remark } = e.detail.value
    if (!name) {
      return wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
    }

    if (!this.data.form.role) {
      return wx.showToast({
        title: '请选择角色',
        icon: 'none'
      })
    }

    if (!this.data.form.gender) {
      return wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
    }

    this.setData({ submitting: true })
    try {
      const db = wx.cloud.database()
      const data = {
        name,
        remark,
        avatarUrl: this.data.form.avatarUrl,
        role: this.data.form.role,
        gender: this.data.form.gender,
        relations: this.data.form.relations,
        updateTime: db.serverDate()
      }

      if (this.data.id) {
        await db.collection('family_members').doc(this.data.id).update({
          data
        })
      } else {
        data.createTime = db.serverDate()
        data.isDeleted = false
        await db.collection('family_members').add({
          data
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
      await db.collection('family_members').doc(this.data.id).update({
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
  },

  onRoleChange(e) {
    const index = e.detail.value
    this.setData({
      'form.role': this.data.roles[index].value,
      roleIndex: index
    })
  },

  addRelation() {
    const relations = this.data.form.relations || []
    relations.push({
      memberId: '',
      memberName: '',
      relation: '',
      memberIndex: -1,
      relationIndex: -1
    })
    this.setData({
      'form.relations': relations
    })
  },

  removeRelation(e) {
    const index = e.currentTarget.dataset.index
    const relations = this.data.form.relations
    relations.splice(index, 1)
    this.setData({
      'form.relations': relations
    })
  },

  onRelationMemberChange(e) {
    const index = e.currentTarget.dataset.index
    const memberIndex = e.detail.value
    const member = this.data.members[memberIndex]
    const relations = this.data.form.relations
    relations[index] = {
      ...relations[index],
      memberId: member._id,
      memberName: member.name,
      memberIndex
    }
    this.setData({
      'form.relations': relations
    })
  },

  onRelationTypeChange(e) {
    const index = e.currentTarget.dataset.index
    const relationIndex = e.detail.value
    const relationType = this.data.relationTypes[relationIndex]
    const relations = this.data.form.relations
    relations[index] = {
      ...relations[index],
      relation: relationType.value,
      relationIndex
    }
    this.setData({
      'form.relations': relations
    })
  },

  onGenderChange(e) {
    const value = e.detail.value
    this.setData({
      'form.gender': value
    })
  }
}) 