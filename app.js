//app.js
var md5 = require("/utils/md.js");
var url = require("/utils/util.js").url
var customer_id = require("utils/custom.js").customer_id
App({
    onLaunch: function (options) {
        var that = this
        wx.onBackgroundAudioStop(function(){
            if(!that.globalData.hideMusic && that.globalData.playing){
                wx.playBackgroundAudio({
                    dataUrl: that.globalData.musicSrc,
                })
            }
        })
        getStatus(that)
    },
    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.getUserInfo({
                withCredentials: false,
                success: function (res) {
                    that.globalData.userInfo = res.userInfo
                    typeof cb == "function" && cb(that.globalData.userInfo)
                }
            })
        }
    },
    globalData: {
        userInfo: null,
        playing: true,
        status:1,
        head:'',
        nickname:'',
        code:'',
        openid:'',
        user_id:0,
        bgc:1,
        musicSrc:''
    },
    onHide:function(){
        wx.stopBackgroundAudio()
    }
})
function getId(that,head,nickname) {
    var myCode;
    var sign;
    var code;
    wx.request({
        url: url + '/sign.json?customer_id=' + customer_id,
        method: 'POST',
        success: (res) => {
            // console.log(res)
            if (res.data.ret == 200) {
                // wx.setStorageSync('code', res.data.data.code)
                that.globalData.code = res.data.data.code
                code = res.data.data.code;
                wx.login({
                    success: (res) => {
                        // console.log('2.获取用户CODE:' + res.code)
                        myCode = res.code
                        sign = md5.md5("head=" + head + "&jscode=" + myCode + code)
                        wx.request({
                            url: url + '/dream/user/login.json?customer_id=' + customer_id,
                            method: 'POST',
                            data: {
                                nickname: nickname,
                                head: head,
                                jscode: myCode,
                                sign: sign
                            },
                            success: (res) => {
                                // console.log(res)
                                if (res.data.ret == 200) {
                                    // wx.setStorageSync('openid', res.data.data.openid)
                                    that.globalData.openid = res.data.data.openid
                                    that.globalData.user_id = res.data.data.user_id
                                    wx.hideLoading()
                                } else {
                                    // wx.setStorageSync('openid', '')
                                    that.globalData.openid = ''
                                    wx.hideLoading()
                                    wx.showToast({
                                        title: '获取用户信息失败:' + res.errMsg,
                                    })
                                }
                            },
                            fail: (res) => {
                                // callback('-1')
                                wx.hideLoading()
                                wx.showToast({
                                    title: '获取信息失败:' + res.errMsg,
                                })
                                // wx.setStorageSync('openid', '')
                                that.globalData.openid = ''
                            },
                            complete:(res)=>{
                                // console.log(that.globalData)
                            }
                        })
                    },
                    fail: (res) => {
                        wx.hideLoading()
                        console.log('用户登录失败', res)
                        wx.showToast({
                            title: '登录失败', res,
                        })
                        // wx.setStorageSync('openid', '')
                        that.globalData.openid = ''
                    }
                })
            } else {
                console.log('获取CODE失败:' + res.errMsg)
                // wx.setStorageSync('openid', '')
                that.globalData.openid = ''
            }
        },
        fail: (res) => {
            // getId(that, head, nickname)
        }
    })
    // }
}

//  模版判断
function getStatus(app, callback) {
    wx.request({
        url:url + '/sign.json?customer_id=' + customer_id,
        method:'POST',
        success:(res)=>{
            if(res.data.ret == 200){
                var code = res.data.data.code
                app.globalData.code = res.data.data.code
                wx.request({
                    url: url + '/dream/index/setting.json?customer_id=' + customer_id,
                    method:'POST',
                    data:{
                        customer_id:customer_id,
                        sign: md5.md5('customer_id=' + customer_id + res.data.data.code)
                    },
                    success:(res)=>{
                        // console.log(res)
                        if(res.data.ret == 200){
                            var data = res.data.data
                            app.globalData.title = data.title;
                            app.globalData.title=app.globalData.title.replace(' ','    ');
                            app.globalData.status = data.themes;
                            app.globalData.musicSrc = data.is_music_url;
                            app.globalData.wish_name = data.wish_name;
                            app.globalData.playing = data.is_music == 1 ? true : false
                            app.globalData.hideMusic = data.is_music == 0 ? true : false
                            app.globalData.is_anonymous = data.is_anonymous == 1 ? true : false
                            app.globalData.dream_name = data.dream_name
                            app.globalData.backgroundUrl = data.backgrund_url
                            
                            if (callback) {
                                callback(app)
                            }
                        } else {
                            wx.showToast({
                                title: res.data.msg,
                                image: '/images/fail.png'
                            })
                        }
                    },
                    fail:(res)=>{
                        wx.showToast({
                            title: '基本设置失败,下拉刷新',
                            image:'/images/fail.png'
                        })
                        console.log(res)
                    }
                })
            }else{
                wx.showToast({
                    title: '获取风格失败',
                    image:'/images/fail.png'
                })
                app.globalData.status = 1
                app.globalData.wish_name = '梦想墙'
            }
        },
        fail:(res)=>{
            console.log(res)
            wx.showToast({
                title: res.errMsg,
                image: '/images/fail.png'
            })
            app.globalData.status = 1
            app.globalData.wish_name = '梦想墙'
        }
    })
}