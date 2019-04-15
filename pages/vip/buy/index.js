const WXBizDataCrypt = require('../../../utils/WXBizDataCrypt.js')
const api = require('../../../utils/api.js');
const app = getApp()

Page({
  data: {
    price: 198,
    payType: 1,
    prepayData: {},
    userInfo: {},
    wxUserOauth: {},
    userAccount: {},
  },
  onLoad: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })

    this.getUserAccount()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },
  getUserAccount: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userInfo.id
    }

    api.userAccount({
      data: dataParams,
      success: function (res) {
        that.setData({
          userAccount: res.data.result
        })

        wx.hideLoading()
      }
    })
  },
  choicePayType: function (e) {
    this.setData({
      payType: e.detail.value
    })
  },
  pay: function () {
    var that = this

    if (this.data.payType == 1) {
      
    }

    if (this.data.payType == 2) {
      if (this.data.userAccount.mainBanlance < 199) {
        wx.showToast({
          icon: 'none',
          title: '余额不足'
        })

        return false;
      }

      wx.showModal({
        title: '余额支付',
        content: '是否确认购买',
        confirmColor: '#29abae',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '支付中...',
              mask: true
            })

            api.balancePay({
              data: {
                method: 'POST',
                id: 1,
                uid: that.data.userInfo.id,
                price: 199.00,
                orderType: 9
              },
              success: function (res) {

              },
              fail: function (res) {
                //
              },
              complete: function (res) {
                console.log(res);
                app.getVipInfo()
                that.getUserAccount()

                wx.showToast({
                  icon: 'success',
                  title: '支付成功'
                })
              }
            })
          }
        }
      })
    }
  },
  wechatPay: function () {
    var that = this

    api.wechatPay({
      data: {
        method: "POST",
        openid: that.data.wxUserOauth.openid,
        // price: 19800,
        price: 1,
        description: "每日听书VIP(365天)",
        ip: "183.128.95.82"
      },
      success: function (res) {
        if (res.data.code == '-1') {
          wx.showToast({
            icon: 'none',
            title: '暂时无法支付'
          })

          return false;
        }

        wx.requestPayment({
          'timeStamp': res.data.result.timeStamp,
          'nonceStr': res.data.result.nonceStr,
          'package': res.data.result.packageVar,
          'signType': res.data.result.signType,
          'paySign': res.data.result.paySign,
          success: function (res) {
            console.log(res)

            api.paySuccessedUpdateVip({
              data: {
                method: 'POST',
                uid: that.data.userInfo.id
              },
              success: function (res) {
                app.getVipInfo()

                setTimeout(function () {
                  wx.showToast({
                    icon: 'success',
                    title: '支付成功'
                  })
                }, 2000)
              }
            })
          }
        })
      }
    })
  },
  onGotUserInfo: function (e) {
    var wxUserInfo = wx.getStorageSync('wxUserInfo')
    var wxUserOauth = wx.getStorageSync('wxUserOauth')

    this.setData({
      wxUserOauth: wxUserOauth,
      wxUserInfo: wxUserInfo
    })

    if (wxUserInfo.openId && wxUserOauth.openid) {
      wx.hideLoading()
      this.wechatPay()
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

              wx.showLoading({
                title: '请等待...',
              })

              wx.setStorage({
                key: 'wxUserInfo',
                data: data,
              })

              wx.hideLoading()
              that.wechatPay()
            }
          })
        }
      })
      
    }
  }
})
