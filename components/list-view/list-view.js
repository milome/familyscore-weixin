Component({
  properties: {
    className: String,
    enablePullRefresh: {
      type: Boolean,
      value: true
    },
    hasMore: {
      type: Boolean,
      value: true
    },
    isEmpty: {
      type: Boolean,
      value: false
    },
    emptyText: {
      type: String,
      value: '暂无数据'
    }
  },

  data: {
    isRefreshing: false,
    loading: false
  },

  methods: {
    async onRefresh() {
      if (this.data.isRefreshing) return
      this.setData({ isRefreshing: true })
      try {
        await this.triggerEvent('refresh')
      } finally {
        this.setData({ isRefreshing: false })
      }
    },

    async onLoadMore() {
      if (this.data.loading || !this.data.hasMore) return
      this.setData({ loading: true })
      try {
        await this.triggerEvent('loadmore')
      } finally {
        this.setData({ loading: false })
      }
    }
  }
}) 