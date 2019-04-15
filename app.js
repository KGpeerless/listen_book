//app.js
const WXBizDataCrypt = require('utils/WXBizDataCrypt.js')
const api = require('utils/api.js')

App({
  globalData: {
    appId: 'wxb434f4c0d7ecf0a5',
    appSecret: 'a387982943037cc06c26e8b18eccca44',
    userInfo: null,
    wxUserInfo: null,
    isIphoneX: false,
    app_currentMusicId: null,
    app_isPlayingMusic: false,
    isRefresh: true
  },

  onLaunch: function () {
    var isFirst = wx.getStorageSync('isFirst')
    if (isFirst === "") {
      wx.setStorage({
        key: 'isFirst',
        data: true,
      })
    }

    var that = this
    this.getUserInfo(function (userInfo) {
      //更新数据
      that.globalData.userInfo = userInfo
    })
    wx.hideLoading()
  },

  onShow: function () {
    let that = this;
    
    // iphoneX判断
    wx.getSystemInfo({
      success: res => {
        // console.log('手机信息res'+res.model)  
        let modelmes = res.model;
        console.log(res);
        if (modelmes.search('iPhone X') != -1) {
          that.globalData.isIphoneX = true
        }

      }
    })
  },
  getUserInfo: function (cb) {
    var that = this

    var userInfo = wx.getStorageSync('userInfo')

    if (userInfo.id > 0) {
      this.globalData.userInfo = userInfo
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      typeof cb == "function" && cb({id: 0})
    }
  },
  getVipInfo: function () {
    wx.setStorage({
      key: 'vip_once',
      data: 0
    })

    var userInfo = wx.getStorageSync('userInfo')
    let that = this

    api.getVipInfo({
      data: {
        method: 'POST',
        uid: userInfo.id > 0 ? userInfo.id : 0,
        type: 3
      },
      success: function (res) {
        var data = res.data.result

        if (res.data.code == 0) {
          if (res.data.result.monthStartDate != null) {
            wx.setStorage({
              key: 'vip_month',
              data: {
                beginDate: res.data.result.monthStartDate.substring(0, 10),
                endDate: res.data.result.monthEndDate.substring(0, 10)
              }
            })
          }

          if (res.data.result.yearStartDate != null) {
            wx.setStorage({
              key: 'vip_year',
              data: {
                beginDate: res.data.result.yearStartDate.substring(0, 10),
                endDate: res.data.result.yearEndDate.substring(0, 10)
              }
            })
          }

          if (res.data.result.timeCardNum != 0) {
            wx.setStorage({
              key: 'vip_once',
              data: res.data.result.timeCardNum
            })
          }
        }
      }
    })
  },
  wechatLogin: function () {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        api.getOpenId({
          data: {
            method: 'POST',
            jsCode: res.code
          },
          success: function (res) {
            var wxUserOauth = res.data.result
            wx.setStorage({
              key: 'wxUserOauth',
              data: wxUserOauth,
            })

            var oauth = wx.getStorageSync('oauth')

            var pc = new WXBizDataCrypt('wxb434f4c0d7ecf0a5', wxUserOauth.session_key)
            var data = pc.decryptData(oauth.encryptedData, oauth.iv)

            wx.setStorage({
              key: 'wxUserInfo',
              data: data,
            })
          }
        })
      }
    })
  }
})