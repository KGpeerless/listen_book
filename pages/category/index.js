const api = require('../../utils/api.js')
const app = getApp()

Page({
  data: {
    userInfo: {},
    categories: [],
    currentCategoryId: 0,
    books: [],
    page: 1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })

    this.getCategories()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },

  getCategories: function() {
    var that = this
    var dataParams = {
      method: 'POST',
      type: 4
    }

    api.getCategories({
      data: dataParams,
      success: function(res) {
        that.setData({
          categories: res.data.result,
          currentCategoryId: res.data.result[0].id
        })

        setTimeout(function () {
          that.getListByCategoryId()
        }, 500)
      }
    })
  },
  getListByCategoryId: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    var that = this
    var dataParams = {
      method: 'POST',
      catetory: that.data.currentCategoryId,
      page: that.data.page,
      pagesize: 10,
      uid: that.data.userInfo.id > 0 ? that.data.userInfo.id : 0
    }

    api.getListByCategoryId({
      data: dataParams,
      success: function (res) {
        if (that.data.page === 1) {
          that.setData({
            books: res.data.result,
            page: that.data.page + 1,
          })
        } else {
          that.setData({
            books: that.data.books.concat(res.data.result),
            page: that.data.page + 1,
          })
        }

        wx.hideLoading()
      }
    })
  },
  //事件处理函数  
  switchRightTab: function (e) {
    // 获取item项的id，和数组的下标值  
    let id = e.target.dataset.id

    // 把点击到的某一项，设为当前index  
    this.setData({
      currentCategoryId: id,
      page: 1,
    })

    this.getListByCategoryId()
  },

  onPullDownRefresh() {
    // console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({ page: 1 })
    this.getListByCategoryId() // 获得第一页列表
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },

  onReachBottom() {
    // console.log('--------上拉加载-------')
    this.getListByCategoryId()
  },
})