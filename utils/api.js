const CryptoJS = require('Crypto.js'); 

const apiURL = 'https://tsdhapi3.rz158.com';
const secretKey = 'f1b79c865c424be46183a2f0a49a0f15';

const wxRequest = (params, url) => {
  var encodeUrl = encodeURIComponent(url);
  var signature = CryptoJS.HmacSHA1(encodeUrl, secretKey).toString();

  params.data['secretKey'] = secretKey;
  params.data['signature'] = signature;

  if (params.data.method == 'POST') {
    var header = { "Content-Type": "application/x-www-form-urlencoded" };
  }

  if (params.data.method == 'GET') {
    var header = { 'Content-Type': 'application/json' };
  }
  
  wx.request({
    url,
    method: params.data.method || 'POST',
    data: params.data || {},
    header: header,
    success(res) {
      if (params.success) {
        params.success(res);
      }
    },
    fail(res) {
      if (params.fail) {
        params.fail(res);
      }
    },
    complete(res) {
      if (params.complete) {
        params.complete(res);
      }
    },
  });
};

// get openid
const getOpenId = (params) => {
  wxRequest(params, `${apiURL}/weiChatMini/weChatLogin`);
}

// 1.1 发送验证码
const sendVerifyCode = (params) => {
  wxRequest(params, `${apiURL}/user/sendVerifyCode`);
}

// 1.2 验证验证码
const verificationUser = (params) => {
  wxRequest(params, `${apiURL}/user/verificationUser_V3_2`);
}

// 1.3 注册
const register = (params) => {
  wxRequest(params, `${apiURL}/user/register_V3_2`);
}

// 1.4 用户账户登录
const pwdLogin = (params) => {
  wxRequest(params, `${apiURL}/user/login`);
}

// 1.5 用户验证码登陆
const codeLogin = (params) => {
  wxRequest(params, `${apiURL}/user/phoneLogin`);
}

// 1.6 微信登陆
const wechatLogin = (params) => {
  wxRequest(params, `${apiURL}/user/weixinLogin`);
}

// 1.7 获取用户信息
const getUserInfo = (params) => {
  wxRequest(params, `${apiURL}/UserInfo/selectByUidDetail`);
}

// 1.8 修改用户信息
const editUserInfo = (params) => {
  wxRequest(params, `${apiURL}/resume/addOrUpdateUserInfo`);
}

// 1.9 上传头像
const uploadAvatar = (params) => {
  wxRequest(params, 'http://dhvapi.rz158.com/file/UpLoadImage');
}

// 2.0 忘记密码
const forgetPassword = (params) => {
  wxRequest(params, `${apiURL}/user/editPassword`);
}

// 2.1.25 查询会员
const getVipInfo = (params) => {
  wxRequest(params, `${apiURL}/mindMain/cardNum_new`);
}

// 2.1.11 分类列表接口
const getCategories = (params) => {
  wxRequest(params, `${apiURL}/mindCategory/getAllMindCategoryV3`);
}

// 2.1.2 分类下的书籍列表
const getListByCategoryId = (params) => {
  wxRequest(params, `${apiURL}/mindMain/getCatetoryListByCodition`);
}

// 2.1.14 我的听书
const getMyListenBooks = (params) => {
  wxRequest(params, `${apiURL}/mindMain/getListenBookVip`);
}

// 2.1.6 主题列表
const getThemeList = (params) => {
  wxRequest(params, `${apiURL}/mindMain/selectThemeList`);
}

// 2.1.6 主题书单列表
const getThemeBookList = (params) => {
  wxRequest(params, `${apiURL}/mindMain/selectThemeBooksList`);
}

// 猜你喜欢
const likeBooks = (params) => {
  wxRequest(params, `${apiURL}/mindMain/guessYourLikeBook`);
}

// 获取首页列表
const getHomeList = (params) => {
  wxRequest(params, `${apiURL}/mindMain/getEveryDayListenBookV3`);
};

// 2.1.3 书籍详情页
const getBookDetail = (params) => {
  wxRequest(params, `${apiURL}/mindMain/getMindMainByIdV3`);
}

// 2.1.23 实体卡激活
const cardActived = (params) => {
  wxRequest(params, `${apiURL}/mindMain/cardActived`);
}

// 2.1.24 第三方支付
const wechatPay = (params) => {
  wxRequest(params, `${apiURL}/weiChatMini/weChatOrder`);
}

// 2.1.13 买书
const buyBook = (params) => {
  wxRequest(params, `${apiURL}/mindBuy/takeABook`);
}

// 次卡买书
const onceCardBuyBook = (params) => {
  wxRequest(params, `${apiURL}/mindBuy/buyABook`);
}

// 扣除次卡
const refreshOnceCard = (params) => {
  wxRequest(params, `${apiURL}/mindMain/useTimeCard_new`);
}

// 查询书被点赞次数
const bookPraiseNumber = (params) => {
  wxRequest(params, `${apiURL}/mindPraise/isPraise`);
}

// 点赞/取消点赞
const bookPraise = (params) => {
  wxRequest(params, `${apiURL}/mindPraise/dotLike`);
}

// 邀请人数
const inviterNumber = (params) => {
  wxRequest(params, `${apiURL}/mindMain/friendNum`);
}

// 已买到的书
const myBoughtBooks = (params) => {
  wxRequest(params, `${apiURL}/mindBuy/getBuyMindList`);
}

// 用户个人数据
const userProfit = (params) => {
  wxRequest(params, `${apiURL}/UserInfo/selectByUidDetail`);
}

// 用户账户
const userAccount = (params) => {
  wxRequest(params, `${apiURL}/account/selectUserAcountBy`);
}

// 用户海报
const userPoster = (params) => {
  wxRequest(params, `${apiURL}/mindMain/getPoster`)
}

// 用户支付成功，更新vip
const paySuccessedUpdateVip = (params) => {
  wxRequest(params, `${apiURL}/mindBuy/vipByThirdPay`);
} 

// 懂行余额支付
const balancePay = (params) => {
  wxRequest(params, `${apiURL}/mindBuy/buyMindOrMemberV3_1`);
}

module.exports = {
  sendVerifyCode,
  verificationUser,
  register,
  pwdLogin,
  codeLogin,
  wechatLogin,
  getMyListenBooks,
  getBookDetail,
  getHomeList,
  getCategories,
  getListByCategoryId,
  getThemeList,
  getThemeBookList,
  cardActived,
  getUserInfo,
  editUserInfo,
  uploadAvatar,
  forgetPassword,
  getVipInfo,
  wechatPay,
  buyBook,
  likeBooks,
  inviterNumber,
  myBoughtBooks,
  userProfit,
  onceCardBuyBook,
  bookPraiseNumber,
  bookPraise,
  userAccount,
  userPoster,
  paySuccessedUpdateVip,
  balancePay,
  refreshOnceCard,
  getOpenId
};