let wxparse = require("../../wxParse/wxParse.js")
const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    query: {
      uid: 0,
      mid: 0
    },
    userInfo: {},
    book: {},
    recommendList: [],
    userVipInfo: {},
    isIphoneX: app.globalData.isIphoneX,
  },
  onLoad: function(options) {
    var userInfo = wx.getStorageSync('userInfo')

    this.setData({
      query: {
        uid: options.uid > 0 ? options.uid : 0,
        mid: options.mid
      },
      userInfo: userInfo.id > 0 ? userInfo : {
        id: 0
      },
      userVipInfo: {
        vip_month: wx.getStorageSync('vip_month'),
        vip_once: wx.getStorageSync('vip_once'),
        vip_year: wx.getStorageSync('vip_year')
      }
    })

    this.getBookDetail()

  },
  onShow: function () {
    app.globalData.isRefresh = true
  },
  getBookDetail: function() {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: this.data.query.uid,
      mid: this.data.query.mid
    }
    api.getBookDetail({
      data: dataParams,
      success: function(res) {
        that.setData({
          book: res.data.result,
          recommendList: res.data.result.recommentBookList
        })

        console.log(res.data.result.introduction)
        console.log(res.data.result.introductionHtml)

        wx.setNavigationBarTitle({
          title: res.data.result.title
        })
        wxparse.wxParse('introductionHtml', 'html', res.data.result.introductionHtml, that, 0);
        wxparse.wxParse('introduction', 'html', res.data.result.introduction, that, 0);
      }
    })
  },
  // 临时听书跳转
  listen: function(event) {
    var that = this
    wx.navigateTo({
      url: '../listen/index?mid=' + that.data.query.mid
    })
  },
  bindBooksDetail: function(event) {
    var uid = event.currentTarget.dataset.uid
    var mid = event.currentTarget.dataset.mid
    wx.navigateTo({
      url: `../books/index?uid=${uid}&mid=${mid}`
    })
  },
  goLogin: function() {
    wx.navigateTo({
      url: '../sign/index/index'
    })
  },
  goOpenVip: function() {
    wx.navigateTo({
      url: '../vip/index'
    })
  },
  vipBuy: function() {
    var that = this
    var dataParams = {
      method: 'POST',
      mid: that.data.query.mid,
      uid: that.data.query.uid
    }

    api.buyBook({
      data: dataParams,
      success: function() {
        wx.showToast({
          title: '成功拿下！',
        })

        that.getBookDetail()
      }
    })
  },
  onceCardBuy: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      mid: that.data.query.mid,
      uid: that.data.query.uid
    }

    wx.showModal({
      title: '是否使用次卡拿下这本书？',
      content: '剩余次数:' + this.data.userVipInfo.vip_once + '次',
      confirmColor: '#29abae',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理中...',
            mask: true
          })

          api.onceCardBuyBook({
            data: dataParams,
            success: function() {
              wx.showToast({
                title: '成功拿下！',
              })

              api.refreshOnceCard({
                data: {
                  method: 'POST',
                  uid: that.data.userInfo.id
                },
                success: function() {
                  that.getBookDetail()
                  
                  app.getVipInfo()
                  
                  wx.hideLoading()
                }
              })
            }
          })
        }
      }
    })
  }
})