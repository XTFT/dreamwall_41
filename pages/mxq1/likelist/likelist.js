// pages/mxq1/likelist/likelist.js
var app = getApp()
var url = require('../../../utils/util.js').url
var md5 = require('../../../utils/md.js');
var http_host = require('../../../utils/util.js').http_host
var customer_id = require('../../../utils/custom.js').customer_id
Page({

    /**
     * 页面的初始数据
     */
    data: {
        playing: app.globalData.playing,
        list:[],
        http_host: http_host
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var id = parseInt(options.id)
        that.setData({
            id:id
        })
        if(options.share){
            getId(that, function(newId){
                getList(id, app.globalData.code, that)
            })
        }else{
            var code = app.globalData.code;
            getList(id, code, that)
            if (wx.setNavigationBarColor) {
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: '#ffffff',
                })
            } else {
                return
            }
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            playing: app.globalData.playing,
            backgroundUrl: app.globalData.backgroundUrl,
            hideMusic: app.globalData.hideMusic,
            url: url
        })


        if (!app.globalData.hideMusic && app.globalData.playing) {
            wx.onBackgroundAudioStop(function () {
                wx.playBackgroundAudio({
                    dataUrl: app.globalData.musicSrc,
                })
            })
        }
    },
    // BGM播放停止
    playBgm: function () {
        var that = this
        this.setData({
            playing: !this.data.playing
        })
        if (!app.globalData.playing) {
            wx.playBackgroundAudio({
                dataUrl: app.globalData.musicSrc,
                success: (res) => {
                    app.globalData.playing = true
                },
                fail: (res) => {
                    wx.showToast({
                        title: '播放失败',
                    })
                }
            })
        } else {
            wx.pauseBackgroundAudio()
            app.globalData.playing = false
        }
    },
    onPullDownRefresh:function(){
        var that = this
        var code = app.globalData.code;
        var id = that.data.id
        getList(id, code, that)
    },
    onShareAppMessage:function(){
        var that = this
        return {
            title: '梦想墙',
            path: '/pages/mxq1/likelist/likelist?id=' + that.data.id+'&share=true',
            success: function (res) {
              app.globalData.playing = false;
              that.setData({
                playing: false,
              })
                wx.showToast({
                    title: '转发成功',
                })
            },
            fail: function (res) {
                console.log(res)
                wx.showToast({
                    title: '转发失败',
                    image: '/images/fail.png'
                })
            }
        }
    }
})
function getList(id, code, that) {
    wx.showLoading({
        title: 'loading',
    })
    wx.request({
        url: url + '/dream/index/likes.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id:customer_id,
            id: id,
            sign: md5.md5('customer_id=' + customer_id+ '&id=' + id + code)
        },
        success: (res) => {
            // console.log(res)
            if(res.data.ret == 200){
                that.setData({
                    list:res.data.data
                })
                if (wx.setNavigationBarTitle) {
                    wx.setNavigationBarTitle({
                        title: res.data.data.length + '人赞过'
                    })
                } else {
                    // console.log('in2')
                    return
                }
            }
        },
        fail: (res) => {
            console.log(res)
            wx.showToast({
                title: res.data,
            })
            wx.navigateBack({

            })
        },
        complete: function () {
            wx.hideLoading()
            wx.stopPullDownRefresh()
        }
    })
}
function getId(that, callback) {
    var myCode;
    var sign;
    var head;
    var nickname;
    var code;
    wx.request({
        url: url + '/sign.json?customer_id=' + customer_id,
        method: 'POST',
        success: (res) => {
            // console.log('sign:',res)
            if (res.data.ret == 200) {
                app.globalData.code = res.data.data.code
                code = res.data.data.code;
                wx.login({
                    success: (res) => {
                        // console.log('2.获取用户CODE:' + res.code)
                        myCode = res.code
                        wx.getUserInfo({
                            success: (res) => {
                                head = res.userInfo.avatarUrl
                                nickname = res.userInfo.nickName
                                app.globalData.head = head
                                app.globalData.nickname = nickname;
                                wx.request({
                                    url: url + '/dream/user/login.json?customer_id=' + customer_id,
                                    method: 'POST',
                                    data: {
                                        customer_id: customer_id,
                                        nickname: nickname,
                                        head: head,
                                        jscode: myCode,
                                        sign: md5.md5('customer_id=' + customer_id + "&head=" + head + "&jscode=" + myCode + code)
                                    },
                                    success: (res) => {
                                        // console.log('登录res:', res)
                                        if (res.data.ret == 200) {
                                            // wx.setStorageSync('openid', res.data.data.openid)
                                            app.globalData.openid = res.data.data.openid
                                            app.globalData.user_id = res.data.data.user_id
                                            that.setData({
                                                user_id: res.data.data.user_id
                                            })
                                            if (callback) {
                                                callback(res.data.data.openid)
                                            }
                                            // wx.hideLoading()
                                        } else {
                                            // wx.setStorageSync('openid', '')
                                            app.globalData.openid = ''
                                            // callback({ openid: '-1' })
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
                                        app.globalData.openid = ''
                                    }
                                })
                            },
                            fail: (res) => {
                                app.globalData.head = ''
                                app.globalData.nickname = ''
                                app.globalData.openid = ''
                            }
                        })

                    },
                    fail: (res) => {
                        wx.hideLoading()
                        wx.showToast({
                            title: '登录失败', res,
                        })
                        app.globalData.openid = ''
                    }
                })

            } else {
                console.log('获取CODE失败:' + res.errMsg)
                app.globalData.openid = ''
            }
        },
        fail: (res) => {
            wx.hideLoading()
            // that.setData({
            //     tips:res.errMsg
            // })
            wx.showToast({
                title: res.msg,
                duration: 10000
            })
            // wx.setStorageSync('code', '-1')
            app.globalData.openid = ''
            console.log('获取CODE失败:' + res.errMsg)
        }
    })
    // }
}