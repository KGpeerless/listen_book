//index.js
//获取应用实例
const api = require('../../utils/api.js');
const app = getApp()

Page({
  data: {
    theme: {},
    themeId: 0,
    userInfo: {},
    page: 1
  },
  onLoad: function (options) {
    this.setData({
      themeId: options.themeId,
      userInfo: wx.getStorageSync('userInfo')
    })

    this.getThemeBookList()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },
  getThemeBookList: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userInfo.id > 0 ? that.data.userInfo.id : 0,
      themeId: that.data.themeId,
      page: that.data.page,
      pagesize: 10
    }

    api.getThemeBookList({
      data: dataParams,
      success: function (res) {
        console.log(res);
        if (that.data.page === 1) {
          that.setData({
            theme: res.data.result,
            bookList: res.data.result.bookList,
            page: that.data.page + 1
          })
        } else {
          that.setData({
            bookList: that.data.bookList.concat(res.data.result.bookList),
            page: that.data.page + 1
          })
        }
        wx.hideLoading()
      }
    })
  },
  bindBooksDetail: function (event) {
    var uid = event.currentTarget.dataset.uid
    var mid = event.currentTarget.dataset.mid
    wx.navigateTo({
      url: `../books/index?uid=${uid}&mid=${mid}`,
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
    this.getThemeBookList() // 获得第一页列表
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },

  onReachBottom() {
    // console.log('--------上拉加载-------')
    this.getThemeBookList()
  },
})
