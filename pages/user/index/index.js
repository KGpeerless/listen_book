const api = require('../../../utils/api.js');
const app = getApp();

// pages/user/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {id: 0},
    userProfit: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onShow: function () {
    app.getVipInfo()

    app.globalData.isRefresh = true
    wx.setNavigationBarTitle({ title: '我的' })

    //更新数据
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })

    this.getInviterNumber()

    if (this.data.userInfo.id > 0) {
      this.getUserProfit()
    }
  },

  getInviterNumber: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userInfo.id
    }

    api.inviterNumber({
      data: dataParams,
      success: function (res) {
        wx.setStorageSync('inviterNumber', res.data.result)
      }
    })
  },
  getUserProfit: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userInfo.id
    }

    api.userProfit({
      data: dataParams,
      success: function (res) {
        that.setData({
          userProfit: res.data.result
        })

        wx.setStorageSync('userProfit', res.data.result)
      }
    })
  },
  // 栏目跳转
  goPage: function (event) {
    if (!this.data.userInfo.id || this.data.userInfo.id == 0) {
      wx.navigateTo({
        url: '../../sign/index/index',
      })

      return false;
    }

    var types = event.currentTarget.dataset.type;
    var url = '../../user/' + types + '/index';
    
    wx.navigateTo({
      url: url
    })
  },

  logout: function() {
    wx.showLoading({
      title: '退出登录中...',
      mask: true
    })

    wx.setStorage({
      key: 'userInfo',
      data: {},
    })

    wx.setStorage({
      key: 'userProfit',
      data: {},
    })

    wx.setStorage({
      key: 'vip_year',
      data: {},
    })
    wx.setStorage({
      key: 'vip_month',
      data: {},
    })
    wx.setStorage({
      key: 'vip_once',
      data: {},
    })

    wx.setStorage({
      key: 'isFirst',
      data: true,
    })

    setTimeout(function () {
      wx.hideLoading()
      wx.reLaunch({
        url: '../../user/index/index',
      })
    }, 2000)
  },
})