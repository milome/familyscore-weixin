export const navigate = {
  // 普通页面跳转
  to(url, params = {}) {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    wx.navigateTo({
      url: queryString ? `${url}?${queryString}` : url
    })
  },

  // 带数据返回的页面跳转
  async toForResult(url, params = {}) {
    return new Promise((resolve) => {
      const eventChannel = this.to(url, {
        ...params,
        _callback: true
      })
      eventChannel.on('returnData', (data) => {
        resolve(data)
      })
    })
  },

  // 返回上一页并传递数据
  back(data) {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData(data)
    }
    wx.navigateBack()
  }
} 