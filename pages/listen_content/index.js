var WxParse = require('../../wxParse/wxParse.js');
const api = require('../../utils/api.js');
var app = getApp();
// pages/listen_content/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    title: '',
    content: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : { id: 0 }
    })

    var that = this;
    // 获得书籍详情
    var dataParams = { method: 'POST', mid: options.mid, uid: that.data.userInfo.id }
    api.getBookDetail({
      data: dataParams,
      success: function (res) {
        console.log(res);
        var content = res.data.result.mindDetailPlayVo.contentHtml;
        WxParse.wxParse('content', 'html', content, that, 5);
        that.setData({
          title: res.data.result.mindDetailPlayVo.title,
        })

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShow: function () {
    app.globalData.isRefresh = true
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})