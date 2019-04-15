const api = require('../../../utils/api.js')
const app = getApp()

// pages/user/setting/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    userProfit: {},
    realname: '',
    gender: 1,
    head: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userProfit = wx.getStorageSync('userProfit')

    this.setData({
      userProfit: userProfit,
      gender: userProfit.gender > 0 ? userProfit.gender : 1,
      realname: userProfit.realName,
      head: userProfit.head
    })
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },
  realnameInput: function (e) {
    this.setData({
      realname: e.detail.value
    })
  },
  updateUserInfo: function () {
    wx.showLoading({
      title: '请等待....',
    })
    var that = this
    var dataParams = {
      method: "POST",
      id: that.data.userProfit.id,
      uid: that.data.userProfit.uid,
      realName: that.data.realname,
      gender: that.data.gender,
      paths: that.data.head
    }

    api.editUserInfo({
      data: dataParams,
      success: function(res) {
        that.getUserProfit()

        wx.showToast({
          icon: 'success',
          title: '保存成功'
        })

        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  uploadPhoto: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;

        wx.showToast({
          icon: "loading",
          title: "正在上传"
        }),

        wx.uploadFile({
          url: 'https://tsdhapi3.rz158.com/weiChatMini/uploadImage',
          filePath: tempFilePaths[0],
          name: 'uploadFile',
          header: { "Content-Type": "multipart/form-data" },
          success: function (res) {
            if (res.statusCode != 200) {
              wx.showModal({
                title: '提示',
                content: '上传失败',
                showCancel: false
              })
              return;
            }

            var data = JSON.parse(res.data);

            //上传成功修改显示头像
            that.setData({
              head: data.result.url
            })

            that.getUserProfit()
          },
          fail: function (e) {
            console.log(e);
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
          },
          complete: function () {
            wx.hideToast();  //隐藏Toast
          }
        })
      }
    })

    
  },
  choiceGender: function() {
    this.setData({
      gender: this.data.gender == 1 ? 2 : 1
    })
  },
  getUserProfit: function () {
    var that = this
    var dataParams = {
      method: 'POST',
      uid: that.data.userProfit.uid
    }

    api.userProfit({
      data: dataParams,
      success: function (res) {
        that.setData({
          userProfit: res.data.result
        })

        wx.setStorageSync('userProfit', res.data.result)
      }
    })
  }
})