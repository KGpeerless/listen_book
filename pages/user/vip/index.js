const api = require('../../../utils/api.js')
const app = getApp()

// pages/user/vip/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userVipInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '我的会员' })

    this.setData({
      userVipInfo: {
        vip_month: wx.getStorageSync('vip_month'),
        vip_once: wx.getStorageSync('vip_once'),
        vip_year: wx.getStorageSync('vip_year')
      }
    })
  },
  onShow: function () {
    app.globalData.isRefresh = true
  }
})