const api = require('../../../utils/api.js')
const app = getApp()

// pages/sign/forget/index.js
var interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '请输入手机号码',
    steps: 'code', // 步骤 code：填写手机；setpwd：设置密码
    codeTap: 'getCode', // 验证码绑定事件
    codeClass: '', // 验证码按钮样式
    codeTitle: '获取验证码', // 验证码按钮内容
    sureTap: 'checkCode', // 确认按钮
    types: 'signup',
    mobile: '',
    verifyCode: '',
    errorMsg: '',
    password: '',
    rePassword: '',
    headPhoto: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoADzXrrq5rcxZtUluFUmrefPlvgQwjDBuIQ9cHrAZdj9GaCHlStic4WniaMLr1cyVkiczzDHA0WXv6Q/132',
    inviterUserId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({ types: options.types })

    if (this.data.types == 'forget') {
      wx.setNavigationBarTitle({ title: '忘记密码' })
    } else {
      wx.setNavigationBarTitle({ title: '注册' })
    }

    var inviterUserId = wx.getStorageSync('inviterUserId');
    this.setData({
      inviterUserId: inviterUserId > 0 ? inviterUserId : 0
    })
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
              console.log('asdasd');
            }
          }, 1000)
        }
      }
    })

  },

  // 提交验证码
  checkCode: function (event) {
    var that = this;
    // 接口验证

    if (this.data.types == 'forget') {
      var dataParams = {
        method: 'POST',
        telephone: this.data.mobile,
        verifyCode: this.data.verifyCode,
        password: '123456',
        type: 1
      };
      api.verificationUser({
        data: dataParams,
        success: function (res) {
          if (res.data.code != 0) {
            that.setErrorMessage(res.data.message);
          }

          if (res.data.code == 0) {
            that.setData({
              steps: 'setpwd',
              sureTap: 'updatePwd', // 修改密码
              title: '设置新密码',
            })
          }
        }
      })
    } else {
      var dataParams = { 
        method: 'POST', 
        telephone: this.data.mobile,
        verifyCode: this.data.verifyCode,
        password: '123456',
        type: 1
      };
      api.verificationUser({
        data: dataParams,
        success: function (res) {
          if (res.data.code != 0) {
            that.setErrorMessage(res.data.message);
          }

          if (res.data.code == 0) {
            that.setData({
              steps: 'setpwd',
              sureTap: 'siginup', // 提交注册
              title: '设置密码',
            })
          }
        }
      })
    }
  },

  // 修改密码
  updatePwd: function (event) {
    var that = this;
    // 接口验证
    var dataParams = {
      method: 'POST',
      verifyCode: this.data.verifyCode,
      telephone: this.data.mobile,
      password: this.data.password
    }

    api.forgetPassword({
      data: dataParams,
      success: function (res) {
        console.log(res)
      }
    })

  },

  // 提交注册
  siginup: function () {
    var that = this;

    if (this.data.password != this.data.rePassword) {
      this.setErrorMessage('两遍密码不一致，请重新输入！');
    }

    var dataParams = {
      method: 'POST',
      telephone: this.data.mobile,
      username: this.data.mobile,
      verifyCode: this.data.verifyCode,
      type: 2,
      password: this.data.password,
      toUid: this.data.inviterUserId
    };

    api.register({
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
          
          wx.reLaunch({
            url: '../../user/index/index'
          })
        }
      }
    })
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
  rePasswordInput: function (e) {
    this.setData({
      rePassword: e.detail.value
    })
  }
})