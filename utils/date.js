/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 判断是否是同一天
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
}

/**
 * 格式化为友好的日期显示
 */
function formatFriendlyDate(date) {
  const today = new Date()
  if (isSameDay(date, today)) {
    return '今天'
  }
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) {
    return '昨天'
  }
  
  return formatDate(date)
}

module.exports = {
  formatDate,
  isSameDay,
  formatFriendlyDate
} 