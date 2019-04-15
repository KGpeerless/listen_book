const api = require('../../../utils/api.js')
const app = getApp()

var interval = null //倒计时函数

Page({
  data: {
    title: '请输入手机号码',
    codeTap: 'getCode', // 验证码绑定事件
    codeClass: '', // 验证码按钮样式
    codeTitle: '获取验证码', // 验证码按钮内容
    sureTap: 'checkCode', // 确认按钮
    verifyCode: '',
    errorMsg: '',
    mobile: '',
    password: '',
    avatarUrl: '',
    openid: '',
    username: '',
    type: 2,
    inviterUserId: 0,
    wxUserInfo: {}
  },
  onLoad: function (options) {
    var that = this

    wx.setNavigationBarTitle({ title: '绑定手机号' })
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ errorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 2000);
  },
  setErrorMessage: function (message) {
    this.setData({
      errorMsg: message
    });

    this.ohShitfadeOut();

    return;
  },
  mobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  verifyCodeInput: function (e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  // 获取验证码
  getCode: function (event) {
    var that = this;

    var dataParams = { method: 'POST', telephone: this.data.mobile }

    api.sendVerifyCode({
      data: dataParams,
      success: function (res) {
        if (res.data.code != 0) {
          that.setErrorMessage(res.data.message);
        }

        if (res.data.code == 0) {
          that.setData({
            codeTap: '',
            codeClass: 'active',
            currentTime: 61,
            codeTitle: '获取验证码',
          })

          var currentTime = that.data.currentTime
          interval = setInterval(function () {
            currentTime--;
            if (currentTime > 0) {
              that.setData({
                codeTitle: currentTime + '秒后重新获取'
              })
            } else {
              clearInterval(interval)
              that.setData({
                codeTitle: '重新发送',
                currentTime: 61,
                codeClass: '',
                codeTap: 'getCode',
              })
            }
          }, 1000)
        }
      }
    })

  },

  // 提交验证码
  checkCode: function (event) {
    this.setData({
      wxUserInfo: wx.getStorageSync('wxUserInfo')
    })

    var that = this;
    // 接口验证

    var dataParams = {
      method: 'POST',
      telephone: this.data.mobile,
      verifyCode: this.data.verifyCode,
      password: this.data.password,
      type: 2,
      unionId: that.data.wxUserInfo.unionId,
    };
    api.verificationUser({
      data: dataParams,
      success: function (res) {
        if (res.data.code != 0) {
          that.setErrorMessage(res.data.message);
        }

        if (res.data.code == 0) {
          api.register({
            data: {
              method: 'POST',
              telephone: that.data.mobile,
              password: that.data.password,
              headPhoto: that.data.wxUserInfo.avatarUrl,
              username: that.data.wxUserInfo.nickName,
              type: 1,
              unionId: that.data.wxUserInfo.unionId,
              token: that.data.wxUserInfo.openId,
              toUid: that.data.inviterUserId,
              verifyCode: that.data.verifyCode
            },
            success: function (res) {
              if (res.data.username == '') {
                that.setErrorMessage(res.data.message);
              }

              if (res.data.username != '') {
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
        }
      }
    })
  }
})