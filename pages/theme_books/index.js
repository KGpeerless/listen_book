const api = require('../../utils/api.js');
const app = getApp()

Page({
  data: {
    books: [],
    page: 1,
  },
  onLoad: function (options) {
    this.getThemeBooks()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },
  getThemeBooks: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    var that = this
    var dataParams = {
      method: 'POST',
      page: that.data.page,
      pagesize: 10
    }

    api.getThemeList ({
      data: dataParams,
      success: function (res) {
        if (that.data.page === 1) {
          that.setData({
            books: res.data.result,
            page: that.data.page + 1,
          })
        } else {
          that.setData({
            books: that.data.books.concat(res.data.result),
            page: that.data.page + 1,
          })
        }
        wx.hideLoading()
      }
    })
  },
  bindThemeBooksDetail: function (event) {
    console.log(event);
    wx.navigateTo({
      url: '../theme_books/detail?themeId=' + event.target.dataset.id,
      success: function (res) {
        // success
        // console.log('nav success')
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },

  onPullDownRefresh() {
    // console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({ page: 1 })
    this.getThemeBooks() // 获得第一页列表
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },

  onReachBottom() {
    // console.log('--------上拉加载-------')
    this.getThemeBooks()
  },
})