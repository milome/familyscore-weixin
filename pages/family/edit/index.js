const userService = require('../../../services/user')
const memberService = require('../../../services/members')

const ROLES = [
  { id: 'father', name: '爸爸', icon: '👨' },
  { id: 'mother', name: '妈妈', icon: '👩' },
  { id: 'grandfather', name: '爷爷', icon: '👴' },
  { id: 'grandmother', name: '奶奶', icon: '👵' },
  { id: 'maternal_grandfather', name: '外公', icon: '👴' },
  { id: 'maternal_grandmother', name: '外婆', icon: '👵' },
  { id: 'other', name: '其他', icon: '👤' }
]

Page({
  data: {
    id: '',
    childId: '',
    name: '',
    phone: '',
    role: '',
    roleList: ROLES,
    selectedRole: null,
    loading: false,
    mode: 'add'
  },

  onLoad(options) {
    if (options.childId) {
      this.setData({ childId: options.childId })
    }
    if (options.id) {
      this.setData({ 
        id: options.id,
        mode: 'edit'
      })
      this.loadFamilyDetail(options.id)
    }
  },

  async loadFamilyDetail(id) {
    try {
      this.setData({ loading: true })
      const { data } = await memberService.getMemberDetail('family', id)
      const selectedRole = ROLES.find(r => r.id === data.role) || ROLES[6] // 默认其他
      this.setData({
        name: data.name,
        phone: data.phone,
        role: data.role,
        selectedRole
      })
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  onNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 选择角色
  selectRole(e) {
    const { role } = e.currentTarget.dataset
    this.setData({
      selectedRole: role,
      role: role.id
    })
  },

  async onSave() {
    const { name, phone, role, childId, mode, id } = this.data
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }

    if (!phone || !/^1\d{10}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }

    if (!role) {
      wx.showToast({
        title: '请选择角色',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loading: true })

      let result
      if (mode === 'add') {
        // 先添加家人成员
        const memberData = {
          name: name.trim(),
          phone,
          role,
          type: 'family'
        }

        const memberResult = await memberService.addMember('family', memberData)

        if (!memberResult.success) {
          wx.showToast({
            title: memberResult.message || '保存失败',
            icon: 'none'
          })
          return
        }

        // 再建立关系
        result = await userService.addFamilyRelation(
          childId,
          memberResult.data._id,
          role
        )
      } else {
        // 更新家人信息
        result = await memberService.updateMember('family', id, {
          name: name.trim(),
          phone,
          role
        })
      }

      if (!result.success) {
        wx.showToast({
          title: result.message || '保存失败',
          icon: 'none'
        })
        return
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
      this.setData({ loading: false })
    }
  },

  // 添加返回方法
  goBack() {
    wx.navigateBack()
  }
}) 