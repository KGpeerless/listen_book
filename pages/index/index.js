const api = require('../../utils/api.js');
const Util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    commentBooks: [],
    themeBooks: [],
    likeBooks: [],
    userInfo: {},
    userProfit: {},
    userVipInfo: {},
    isFirst: false,
  },
  onLoad: function (options) {
    if (options.uid && options.uid > 0) {
      wx.setStorage({
        key: 'inviterUserId',
        data: options.uid,
      })
    }

    this.loadList()
  },
  onShow: function () {
    if (app.globalData.isRefresh == true && wx.getStorageSync("isFirst") === true) {

      app.globalData.isRefresh = false

      wx.reLaunch({url: 'index'})
      return false;
    }

    if (wx.getStorageSync("isFirst") === true) {

      this.setData({
        isFirst: true
      })

      wx.hideTabBar({}) // 隐藏导航
    }

    app.getVipInfo()

    var userInfo = wx.getStorageSync('userInfo')

    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : {id: 0},
      userVipInfo: {
        vip_month: wx.getStorageSync('vip_month'),
        vip_once: wx.getStorageSync('vip_once') > 0 ? wx.getStorageSync('vip_once') : 0 ,
        vip_year: wx.getStorageSync('vip_year')
      },
      userProfit: wx.getStorageSync('userProfit'),
      isFirst: wx.getStorageSync("isFirst")
    })

    if (this.data.userVipInfo.vip_year.beginDate || this.data.userVipInfo.vip_once > 0) {
      this.setData({
        isFirst: false
      })

      wx.showTabBar({})  // 显示导航

      wx.setStorage({
        key: "isFirst",
        data: false,
      })
    }
  },
  loadList() {
    var that = this
    var dataParams = { 
      method: 'POST', 
      uid: this.data.userInfo.id > 0 ? this.data.userInfo.id : 0
    }

    api.getHomeList({
      data: dataParams,
      success: function (res) {
        that.setData({
          commentBooks: res.data.result.mindBookVo,
          themeBooks: res.data.result.themeList,
          likeBooks: res.data.result.likeList
        })
      }
    })
  },
  bindBooks: function () {
    wx.navigateTo({
      url: '../theme_books/index'
    })
  },
  bindBooksDetail: function (event) {
    var uid = event.currentTarget.dataset.uid
    var mid = event.currentTarget.dataset.mid
    wx.navigateTo({
      url: `../books/index?uid=${uid}&mid=${mid}`
    })
  },
  bindVip: function () {
    if (!this.data.userInfo || !this.data.userInfo.id || this.data.userInfo.id == 0) {
      wx.navigateTo({
        url: '../sign/index/index',
      })

      return false;
    }

    wx.navigateTo({
      url: '../vip/index'
    })
  },

  // 关闭邀请
  closeInvite: function () {
    this.setData({
      isFirst: false
    })
    
    wx.showTabBar({})  // 显示导航
  },

  // 邀请跳转
  bingInvite: function () {
    this.setData({
      isFirst: false
    })

    wx.showTabBar({}) 

    if (this.data.userInfo.id > 0) {
      wx.navigateTo({
        url: '../user/invite/index'
      })
    } else {
      wx.reLaunch({
        url: '../sign/index/index'
      })
    }
  },
  nextBatchLikeBooks: function() {
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
          likeBooks: res.data.result
        })
      }
    })
  }
})
