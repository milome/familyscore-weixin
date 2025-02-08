async function handleChildSwitch(childId) {
  try {
    // 1. 保存当前孩子上下文
    const currentChildId = await getCurrentChildId()
    if (currentChildId) {
      await saveCurrentContext(currentChildId)
    }
    
    // 2. 切换到新孩子
    await setCurrentChildId(childId)
    
    // 3. 恢复新孩子上下文
    const context = await ChildContextManager.getContext(childId)
    
    // 4. 预加载数据
    await Promise.all([
      loadChildInfo(childId),
      loadChildRules(childId),
      loadRecentRecords(childId)
    ])
    
    // 5. 应用上下文
    applyContext(context)
    
    return true
  } catch (err) {
    console.error('切换孩子失败:', err)
    return false
  }
}

// 保存当前上下文
async function saveCurrentContext(childId) {
  const context = {
    lastPage: getCurrentPage().route,
    calendarMonth: getCalendarMonth(),
    filterSettings: getFilterSettings()
  }
  await ChildContextManager.saveContext(childId, context)
}

// 应用上下文
function applyContext(context) {
  // 恢复日历月份
  setCalendarMonth(context.calendarMonth)
  
  // 恢复筛选设置
  setFilterSettings(context.filterSettings)
  
  // 触发数据刷新
  getCurrentPage().onShow()
} 