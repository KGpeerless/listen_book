const api = require('../../utils/api.js')
var app = getApp();
var interval = null //计时函数

// pages/listen/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoadingHidden: false,
    isIphoneX: app.globalData.isIphoneX,
    isPlayingMusic: false,
    currentTime: 0,
    showCurrentTime: '00:00',
    showDuration: '00:00',
    audition: 180, // 试听时间
    uid: 0, // 用户id
    is_buy: 2, // 是否购买 2：未购买
    isMember: 0, // 是否是会员 0：否；1：是
    listenState: 1, // 当前秒数是否允许播放
    end: 0, // 音乐是否已经播放完毕
    praiseNumber: 0,
    isIphoneX: app.globalData.isIphoneX,
    zanImg: '../../images/zan_icon.png',
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo.id > 0 ? userInfo : {id: 0},
      uid: userInfo.id > 0 ? userInfo.id : 0
    })

    this.setData({
      mid: options.mid,
      isLoadingHidden: true, // false
    });
    
    this.loadVoice()
  },
  onShow: function () {
    app.globalData.isRefresh = true
  },

  // 配置声音文件
  loadVoice() {
    var that = this;
    // 获得书籍详情
    var dataParams = { method: 'POST', mid: that.data.mid, uid: that.data.userInfo.id }
    api.getBookDetail({
      data: dataParams,
      success: function (res) {
        console.log(res);
        var audioData = res.data.result.mindDetailPlayVo;
        // 音乐信息赋值
        var summary = audioData.summary;
        if (audioData.summary.length > 20) {
          summary = audioData.summary.substring(0, 20) + '...';
        }
        that.setData({
          voiceId: audioData.id,
          voiceTitle: audioData.title,
          voiceText: summary,
          voiceUrl: audioData.audioUrl,
          bookImg: audioData.audioImg,
          is_buy: res.data.result.isBuy,
          isMember: res.data.result.memberList,
        })

        api.bookPraiseNumber({
          data: {
            method: 'POST',
            fid: res.data.result.id,
            type: 1
          },
          success: function (res) {
            if (!app.globalData.app_isPlayingMusic || app.globalData.app_currentMusicId !== that.data.voiceId) {
              that.bindInsertAudio() // 插入第一条音乐
            }
            that.setMusicMonitor() // 后台音乐控制事件监听

            that.setData({
              praiseNumber: res.data.obj,
              isLoadingHidden: true
            })
          }
        })
      }
    })
  },

  // 播放 暂停
  bindAudioTap: function () {
    var that = this
    if (this.data.end == 1) {
      that.bindInsertAudio(); // 播放完毕后重新载入音乐
    }

    var isPlayingMusic = this.data.isPlayingMusic;
    
    if (isPlayingMusic) {
      wx.getBackgroundAudioManager().pause(); // 暂停
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.app_isPlayingMusic = false
    } else {
      var allow = that.checkListen();
      if (that.data.listenState == 1) {
        wx.getBackgroundAudioManager().play(); // 播放
        that.setData({
          isPlayingMusic: true
        })
        app.globalData.app_isPlayingMusic = true
      }
    }
  },

  // 插入音乐
  bindInsertAudio: function () {
    var that = this;
    wx.getBackgroundAudioManager().title = that.data.voiceTitle
    wx.getBackgroundAudioManager().coverImgUrl = that.data.bookImg
    wx.getBackgroundAudioManager().src = that.data.voiceUrl

    // 初始化音乐信息
    var currentTime = Math.floor(wx.getBackgroundAudioManager().currentTime) // 当前音频的播放位置
    var duration = Math.floor(wx.getBackgroundAudioManager().duration) // 当前音频的长度
    that.setData({
      currentTime: currentTime,
      duration: currentTime,
      isPlayingMusic: true,
      end: 0,
    })
    app.globalData.app_isPlayingMusic = true
    app.globalData.app_currentMusicId = that.data.voiceId;
  },

  // 后台音乐控制事件监听
  setMusicMonitor: function () {
    var that = this
    // 暂停
    wx.getBackgroundAudioManager().onPause(function () {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.app_isPlayingMusic = false
    });

    // 播放
    wx.getBackgroundAudioManager().onPlay(function () {
      var allow = that.checkListen();
      if (that.data.listenState == 1) {
        that.setData({
          isPlayingMusic: true
        })
        app.globalData.app_isPlayingMusic = true
      } else {
        that.setData({
          listenState: 0
        })
      }
    });

    // 播放完成后
    wx.getBackgroundAudioManager().onEnded(function () {
      //that.bindInsertAudio();
      that.setData({
        end: 1,
        isPlayingMusic: false,
        currentTime: 0,
      })
      app.globalData.app_isPlayingMusic = false
    });

    // 监听播放进度（修改滚动条）
    wx.getBackgroundAudioManager().onTimeUpdate(function () {
      var allow = that.checkListen();
      if (that.data.listenState == 1) {
        var showCurrentTime = wx.getBackgroundAudioManager().currentTime
        var showDuration = Math.floor(wx.getBackgroundAudioManager().duration)
        that.setData({
          currentTime: Math.floor(wx.getBackgroundAudioManager().currentTime),
          duration: Math.floor(wx.getBackgroundAudioManager().duration),
          showCurrentTime: that.dateformat(showCurrentTime),
          showDuration: that.dateformat(showDuration)
        })
      } else {
        wx.getBackgroundAudioManager().pause(); // 暂停
        that.setData({ isPlayingMusic: false });
        app.globalData.app_isPlayingMusic = false; // 试听结束，暂停
      }
  
    });
  },

  // 检测内容是否可继续播放
  checkListen: function () {
    var that = this;
    var allow = 0;
    var unlogin_tip_show = 0;
    var unvip_tip_show = 0;

    allow = 1
    
    // 未购买，3分钟内可试听
    if ((that.data.isBuy != 1 || that.data.isBuy != 3) && that.data.currentTime >= that.data.audition) {
      
      // 试听结束，未登陆
      if (that.data.uid == 0) {
        allow = 0
        unlogin_tip_show = 1
      }

      // 试听结束，未买过书
      if (that.data.uid > 0 && (that.data.is_buy != 3 && that.data.is_buy != 1)) {
        allow = 0
        unvip_tip_show = 1
      }
    }

    that.setData({
      unlogin_tip_show: unlogin_tip_show,
      unvip_tip_show: unvip_tip_show,
      listenState: allow
    })
  },

  // 拖动进度条
  bindSliderChange: function (e) {
    var that = this
    var allow = 0;
    if (that.data.is_buy != 2 || that.data.isMember == 1 || !that.data.currentTime) {
      allow = 1; // 已购买或者是会员或者计时未开始可播放
    } else {
      // 未购买，且在三分钟内可播放
      if (e.detail.value < that.data.audition) {
        allow = 1;
      }
    }

    if (allow == 1) {
      if (that.data.isPlayingMusic == false) {
        wx.getBackgroundAudioManager().play();
      }
      wx.getBackgroundAudioManager().seek(e.detail.value)

      var showCurrentTime = that.dateformat(e.detail.value)
      that.setData({
        currentTime: e.detail.value,
        showCurrentTime: showCurrentTime,
        listenState: 1
      })
    } else {
      that.bindAudioTap();
      that.setData({
        listenState: 0,
        currentTime: that.data.audition,
        showCurrentTime: that.dateformat(that.data.audition),
      })
    }
    
  },

  // 快进15秒
  bindSpeedTap: function () {
    var that = this
    if (that.data.is_buy == 2 && that.data.isMember != 1 && that.data.currentTime + 15 > that.data.audition) {
      that.bindAudioTap();
      that.setData({
        listenState: 0,
        currentTime: that.data.audition,
        showCurrentTime: that.dateformat(that.data.audition),
      })
    } else {
      if (that.data.isPlayingMusic == false) {
        wx.getBackgroundAudioManager().play();
      }

      var jumpTime = that.data.currentTime + 15;
      if (jumpTime > that.data.duration) {
        jumpTime = that.data.duration;
      }
      wx.getBackgroundAudioManager().seek(jumpTime)

      var showCurrentTime = that.dateformat(jumpTime)
      that.setData({
        listenState: 1,
        currentTime: jumpTime,
        showCurrentTime: showCurrentTime,
      })
    }
    
  },

  // 回退15秒
  bindBackTap: function () {
    var that = this

    if (that.data.is_buy == 2 && that.data.isMember != 1 && that.data.currentTime - 15 > that.data.audition) {
      that.bindAudioTap();
      that.setData({
        listenState: 0,
        currentTime: that.data.audition,
        showCurrentTime: that.dateformat(that.data.audition),
      })
    } else {
      if (that.data.isPlayingMusic == false) {
        wx.getBackgroundAudioManager().play();
      }
      var jumpTime = that.data.currentTime - 15;
      if (jumpTime < 0) {
        jumpTime = 0;
      }
      
      wx.getBackgroundAudioManager().seek(jumpTime)

      var showCurrentTime = that.dateformat(jumpTime)
      that.setData({
        listenState: 1,
        currentTime: jumpTime,
        showCurrentTime: showCurrentTime,
      })
    }
  },

  // 时间格式化输出
  dateformat: function (micro_second) {
    // 秒数
    var second = Math.floor(micro_second);
    // 小时位
    var hr = Math.floor(second / 3600);
    // 分钟位
    var min = Math.floor((second - hr * 3600) / 60);
    // 秒位
    var sec = (second - hr * 3600 - min * 60);
    if (min && min < 10) min = '0' + min;
    if (!min) min = '00';
    if (sec && sec < 10) sec = '0' + sec;
    if (!sec) sec = '00';
    return min + ":" + sec;
  },

  // 文稿
  listenContent: function (event) {
    var that = this

    wx.navigateTo({
      url: '../listen_content/index?mid=' + that.data.mid
    })
  },

  praise: function () {
    var that = this
    
    if (that.data.uid == 0) {
      wx.showToast({
        icon: 'loading',
        title: '未登录！',
        duration: 800
      })

      return false;
    }

    wx.showLoading({
      title: '正在操作中...',
    })

    api.bookPraise({
      data: {
        method: 'POST',
        uid: that.data.uid,
        fid: that.data.mid,
        type: 1
      },
      success: function (res) {
        var message = res.data.message
        
        api.bookPraiseNumber({
          data: {
            method: 'POST',
            fid: that.data.mid,
            type: 1
          },
          success: function (res) {
            that.setData({
              praiseNumber: res.data.obj,
              zanImg:  '../../images/zan_icon_show.png'
            })

            wx.showToast({
              title: message,
              icon: 'success',
              mask: true
            })
          }
        })
      }
    })
  },

  // 返回
  bindBack: function () {
    var that = this;

    console.log(12);
    that.setData({
      unlogin_tip_show: 0,
    })
  },
  bingLogin: function () {
    wx.reLaunch({
      url: '../sign/index/index',
    })
  },
  bindVip: function () {
    wx.navigateTo({
      url: '../vip/index',
    })
  },
  bindInviter: function () {
    wx.navigateTo({
      url: '../user/invite/index',
    })
  },

  //监听页面卸载
  onUnload: function () {
    wx.getBackgroundAudioManager().pause(); // 暂停
    this.setData({
      isPlayingMusic: false
    })
    app.globalData.app_isPlayingMusic = false
  },
})