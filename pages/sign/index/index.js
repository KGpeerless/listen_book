const app = getApp()
const api = require('../../../utils/api.js')
const WXBizDataCrypt = require('../../../utils/WXBizDataCrypt.js')


// pages/login/index.js
Page({
  data: {
    wxUserInfo: {},
    wxUserOauth: {},
    wxUserLocation: {},
    hasWxUserInfo: false,
  },
  onLoad: function (option) {
    var that = this

    wx.setNavigationBarTitle({
      title: '登录'
    })
  },
  onShow: function () {
    
    app.globalData.isRefresh = true
  },
  wechatLogin: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      unionId: that.data.wxUserInfo.unionId,
    }

    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    api.wechatLogin({
      data: dataParams,
      success: function (res) {
        wx.hideLoading()
        
        if (res.data.code == -1) {
          wx.navigateTo({
            url: '../wechat/bindMobile',
          })
        }

        if (res.data.code == 0) {
          wx.setStorage({
            key: 'userInfo',
            data: res.data.result,
          })

          wx.reLaunch({
            url: '../../user/index/index'
          })
        }
      }
    })
  },

  // 手机登录
  signin: function () {
    wx.navigateTo({
      url: '../in/index?types=signin',
    })
  },

  // 手机注册
  signup: function () {
    wx.navigateTo({
      url: '../up/index?types=signup',
    })
  },
  onGotUserInfo: function (e) {
    if (!e.detail.iv) {
      return false;
    }

    var wxUserInfo = wx.getStorageSync('wxUserInfo')
    var wxUserOauth = wx.getStorageSync('wxUserOauth')

    this.setData({
      wxUserOauth: wxUserOauth,
      wxUserInfo: wxUserInfo
    })

    if (wxUserInfo.openId && wxUserOauth.openid) {
      this.wechatLogin()
      return false;
    }

    var that = this
    var iv = e.detail.iv
    var encryptedData = e.detail.encryptedData
    if (e.detail.encryptedData) {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          api.getOpenId({
            data: {
              method: 'POST',
              jsCode: res.code
            },
            success: function (res) {
              that.setData({
                wxUserOauth: res.data.result
              })

              wx.setStorage({
                key: 'wxUserOauth',
                data: {
                  openid: res.data.result.openid,
                  session_key: res.data.result.session_key
                },
              })

              var pc = new WXBizDataCrypt(app.globalData.appId, res.data.result.session_key)
              var data = pc.decryptData(encryptedData, iv)
              
              that.setData({
                wxUserInfo: data
              })
              
              wx.setStorage({
                key: 'wxUserInfo',
                data: data,
              })

              that.wechatLogin()

              wx.hideLoading()
            }
          })
        }
      })
    }
  }
})
