const api = require('../../../utils/api.js')
const app = getApp()
// pages/sign/inde.js
var interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    login_type: 'phone_num', // 登录类型
    codeTap: 'getCode', // 验证码绑定事件
    codeClass: '', // 验证码按钮样式
    codeTitle: '获取验证码', // 验证码按钮内容
    verifyCode: '',
    mobile: '',
    password: '',
    errorMsg: '',
    userInfo: {},
    monthCard: {},
    onceCard: {},
    yearCard: {},
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.setData({ types: options.types })
    //console.log();
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '登录'
    })
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },

  // 选择登录方式
  choiceTypes: function(event) {
    this.setData({
      login_type: event.currentTarget.dataset.type
    })
  },

  // 忘记密码
  forgetPwd: function(event) {
    wx.navigateTo({
      url: '../up/index?types=forget',
      success: function(res) {
        // success
        // console.log('nav success')
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },

  // 获取验证码
  getCode: function(event) {
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

  mobileInput: function (event) {
    this.setData({
      mobile: event.detail.value      
    })
  },

  passwordInput: function (event) {
    this.setData({
      password: event.detail.value
    })
  },

  verifyCodeInput: function (event) {
    this.setData({
      verifyCode: event.detail.value
    })
  },

  login: function(event) {
    var that = this

    if (that.data.login_type == 'phone_num') {
      var dataParams = {
        method: 'POST',
        telephone: that.data.mobile,
        password: that.data.password
      };

      api.pwdLogin({
        data: dataParams,
        success: function(res) {
          if (res.data.code != 0) {
            that.setErrorMessage(res.data.message);
          }

          if (res.data.code == 0) {
            wx.setStorage({
              key: 'userInfo',
              data: res.data.result,
            })

            that.setData({
              userInfo: res.data.result
            })
            
            wx.reLaunch({
              url: '../../user/index/index'
            })
          }
        }
      })
    }

    if (that.data.login_type == 'code_num') {
      var dataParams = {
        method: 'POST',
        phone: that.data.mobile,
        verificationCode: that.data.verifyCode
      };

      api.codeLogin({
        data: dataParams,
        success: function (res) {
          if (res.data.code != 0) {
            that.setErrorMessage(res.data.message);
          }

          if (res.data.code == 0) {
            wx.setStorage({
              key: 'userInfo',
              data: res.data.result,
            })

            that.setData({
              userInfo: res.data.result
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