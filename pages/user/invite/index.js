const api = require('../../../utils/api.js')
const app = getApp()

// pages/user/invite/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    inviterNumber: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '邀请好友' })

    var userInfo = wx.getStorageSync('userInfo')

    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : { id: 0 }
    })
  },
  onShow: function () {
    this.getInviterNumber()
    app.globalData.isRefresh = true
  },

  // 分享海报
  sharePoster: function () {
    wx.navigateTo({
      url: '../../user/poster/index'
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    console.log(res);

    if (res.from === 'button') {
      // 来自页面内转发按钮
      that.data.shareBtn = true;
    } else {
      //来自右上角转发
      that.data.shareBtn = false;
    }

    return {
      title: '每日听书',
      path: 'pages/index/index?uid=' + that.data.userInfo.id,
      complete: function (res) {
        if (res.errMsg == 'shareAppMessage:ok') {


        } else {
          wx.showToast({
            title: '分享失败',
          })
          that.data.isshare = 0;
        }

      },
    }
  },
  getInviterNumber: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userInfo.id > 0 ? that.data.userInfo.id : 0
    }

    api.inviterNumber({
      data: dataParams,
      success: function (res) {
        var inviterNumber = !res.data.result ? 0 : res.data.result >= 3 ? 3 : res.data.result

        that.setData({
          inviterNumber: inviterNumber
        })

        wx.setStorageSync('inviterNumber', res.data.result)
      }
    })
  }
})