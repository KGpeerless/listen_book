const api = require('../../../utils/api.js')
const app = getApp()

// pages/user/book/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    books: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '我的听书' })

    var userInfo =  wx.getStorageSync('userInfo');

    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : {id: 0}
    })

    this.getMyListenBooks()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },

  getMyListenBooks: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    var that = this
    var dataParams = { method: 'POST', uid: this.data.userInfo.id, type: 4 }

    api.myBoughtBooks({
      data: dataParams,
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            books: res.data.result
          })

          wx.hideLoading()
        }
      }
    })
  },
  bindBooksDetail: function (event) {
    var uid = event.currentTarget.dataset.uid
    var mid = event.currentTarget.dataset.mid
    wx.navigateTo({
      url: `../../books/index?uid=${uid}&mid=${mid}`,
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
})