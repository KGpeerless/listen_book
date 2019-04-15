const api = require('../../utils/api.js');
const app = getApp()

Page({
  data: {
    price: 199,
    userInfo: {},
    userProfit: {},
    inviterNumber: 0,
    books: [],
    userVipInfo: {
      vip_month: {},
      vip_once: {},
      vip_year: {}
    }
  },
  onLoad: function() {
    
  },
  onShow: function () {
    app.globalData.isRefresh = true
    var userInfo = wx.getStorageSync('userInfo')

    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : {id: 0},
      userVipInfo: {
        vip_month: wx.getStorageSync('vip_month'),
        vip_once: wx.getStorageSync('vip_once'),
        vip_year: wx.getStorageSync('vip_year')
      },
      userProfit: wx.getStorageSync('userProfit')
    })

    if (this.data.userInfo.id == 0) {
      wx.navigateTo({
        url: '../sign/index/index',
      })
    }

    if (this.data.userInfo.id > 0) {
      this.likeBooks()
      this.getInviterNumber()
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
  },
  bindSign: function () {
    wx.reLaunch({
      url: '../sign/index/index'
    })
  },
  bindUseCard: function () {
    if (!this.data.userInfo || this.data.userInfo.id == 0) {
      this.bindSign()
    }

    wx.navigateTo({
      url: 'card/index'
    })
  },
  bindGoPay: function() {
    if (!this.data.userInfo || this.data.userInfo.id == 0) {
      this.bindSign()
    }

    wx.navigateTo({
      url: 'buy/index',
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
  likeBooks: function () {
    var that = this
    var dataParams = {
      method: "POST",
      page: 1,
      pagesize: 10
    }

    api.likeBooks({
      data: dataParams,
      success: function (res) {
        that.setData({
          books: res.data.result
        })
      }
    })
  },
  goInviter: function() {
    if (!this.data.userInfo || this.data.userInfo.id == 0) {
      this.bindSign()
    }

    wx.navigateTo({
      url: '../user/invite/index',
    })
  }
})
