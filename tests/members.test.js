const { getMemberList, addMember, updateMember, deleteMember } = require('../services/members')

describe('成员管理功能测试', () => {
  // 测试数据
  const testMember = {
    name: '测试成员',
    remark: '测试备注',
    avatarUrl: ''
  }
  let memberId = ''

  // 清理测试数据
  afterAll(async () => {
    if (memberId) {
      await deleteMember(memberId, true) // 物理删除
    }
  })

  test('添加成员', async () => {
    const result = await addMember(testMember)
    expect(result._id).toBeTruthy()
    memberId = result._id
    expect(result.name).toBe(testMember.name)
    expect(result.remark).toBe(testMember.remark)
    expect(result.isDeleted).toBe(false)
  })

  test('获取成员列表', async () => {
    const list = await getMemberList()
    expect(Array.isArray(list)).toBe(true)
    const member = list.find(m => m._id === memberId)
    expect(member).toBeTruthy()
    expect(member.name).toBe(testMember.name)
  })

  test('更新成员', async () => {
    const updateData = {
      name: '更新名称',
      remark: '更新备注'
    }
    const result = await updateMember(memberId, updateData)
    expect(result.updated).toBe(1)

    const list = await getMemberList()
    const member = list.find(m => m._id === memberId)
    expect(member.name).toBe(updateData.name)
    expect(member.remark).toBe(updateData.remark)
  })

  test('删除成员', async () => {
    const result = await deleteMember(memberId)
    expect(result.updated).toBe(1)

    const list = await getMemberList()
    const member = list.find(m => m._id === memberId)
    expect(member).toBeFalsy()
  })

  test('搜索成员', async () => {
    // 先添加测试数据
    const members = [
      { name: '张三', remark: '测试1' },
      { name: '李四', remark: '测试2' },
      { name: '王五', remark: '测试3' }
    ]
    const ids = []
    for (const m of members) {
      const { _id } = await addMember(m)
      ids.push(_id)
    }

    // 测试搜索
    const list1 = await getMemberList('张')
    expect(list1.length).toBe(1)
    expect(list1[0].name).toBe('张三')

    const list2 = await getMemberList('测试')
    expect(list2.length).toBe(3)

    // 清理测试数据
    for (const id of ids) {
      await deleteMember(id, true)
    }
  })
}) 