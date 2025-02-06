Component({
  properties: {
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '请选择日期'
    }
  },

  data: {
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    selectedDate: '',
    days: []
  },

  lifetimes: {
    attached() {
      this.initCalendar()
      if (this.properties.value) {
        this.setData({ selectedDate: this.properties.value })
      }
    }
  },

  methods: {
    initCalendar() {
      const days = this.generateDays(this.data.currentYear, this.data.currentMonth - 1)
      this.setData({ days })
    },

    generateDays(year, month) {
      const days = []
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const today = new Date()
      
      // 获取上个月的天数
      const prevMonthDays = new Date(year, month, 0).getDate()
      
      // 添加上个月的日期
      for (let i = firstDay.getDay(); i > 0; i--) {
        const day = prevMonthDays - i + 1
        days.push({
          day,
          date: this.formatDate(new Date(year, month - 1, day)),
          type: 'other-month'
        })
      }
      
      // 添加当前月的日期
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        days.push({
          day: i,
          date: this.formatDate(date),
          type: 'current-month',
          isToday: this.isSameDay(date, today),
          isSelected: this.data.selectedDate === this.formatDate(date)
        })
      }
      
      // 添加下个月的日期
      const remainingDays = 42 - days.length // 保持6行
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          date: this.formatDate(new Date(year, month + 1, i)),
          type: 'other-month'
        })
      }
      
      return days
    },

    onDayClick(e) {
      const { date } = e.currentTarget.dataset
      const days = this.data.days.map(day => ({
        ...day,
        isSelected: day.date === date
      }))
      
      this.setData({ 
        selectedDate: date,
        days
      })
      
      this.triggerEvent('change', date)
    },

    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    }
  }
}) 