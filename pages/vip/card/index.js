const api = require('../../../utils/api.js');
const app = getApp()

Page({
  data: {
    userInfo: {},
    cardNumber: '',
    password: ''
  },
  onLoad: function() {
    var userInfo = wx.getStorageSync('userInfo')

    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : { id: 0 }
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
  setErrorMessage: function (message) {
    this.setData({
      errorMsg: message
    });

    this.ohShitfadeOut();

    return;
  },
  cardNumberInput: function (e) {
    this.setData({
      cardNumber: e.detail.value
    })
  },
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  cardActived: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userInfo.id,
      cardNo: that.data.cardNumber,
      password: that.data.password
    }
    
    wx.showLoading({
      title: '正在操作中...',
      mask: true
    })

    api.cardActived({
      data: dataParams,
      success: function(res) {
        if (res.data.code != 0) {
          that.setErrorMessage(res.data.message);
        }

        if (res.data.code == 0) {
          wx.showToast({
            title: '激活成功！',
            icon: 'success',
            duration: 2000,
            success: function () {
              setTimeout(function () {
                //要延时执行的代码
                wx.navigateBack({})
              }, 2000)
            }
          })
        }
      }
    })
  }
})
