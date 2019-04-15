const api = require('../../../utils/api.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterUrl: '',
    userInfo: {},
    wxAccessToken: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
 
    this.getUserPoster()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },

  previewImage: function (e) {
    wx.previewImage({
      current: this.data.posterUrl, // 当前显示图片的http链接 
      urls: [this.data.posterUrl]
    })
  },
  getUserPoster: function () {
    var that = this
    var datapParams = {
      method: 'POST',
      uid: that.data.userInfo.id
    }

    api.userPoster({
      data: datapParams,
      success: function (res) {
        that.setData({
          posterUrl: res.data.result
        })

        wx.hideLoading()
      }
    })
  }
})