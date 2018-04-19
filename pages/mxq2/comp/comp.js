// pages/mxq1/comp/comp.js
var app = getApp()
var url = require('../../../utils/util.js').url
var md5 = require('../../../utils/md.js')
var http_host = require('../../../utils/util.js').http_host
var customer_id = require('../../../utils/custom.js').customer_id
Page({
    data: {
        latitude: '',
        longitude: '',
        spread: false,
        playing: app.globalData.playing,
        http_host: http_host
    },
    onLoad: function (options) {
        var that = this
        if (options.share) {
            getId(that, function () {
                getStatus(app, function () {
                    getCompMsg(that)
                })
            })
        } else {
            getCompMsg(that)
        }
    },
    onShow: function () {
        var that = this
        this.setData({
            playing: app.globalData.playing,
            backgroundUrl: app.globalData.backgroundUrl,
            hideMusic: app.globalData.hideMusic,
            url: url
        })
        
        if (app.globalData.playing && !app.globalData.hideMusc) {
            wx.onBackgroundAudioStop(function () {
                wx.playBackgroundAudio({
                    dataUrl: app.globalData.musicSrc,
                })
            })
        }
    },
    //   展开侧边栏
    spread: function () {
        var that = this
        this.setData({
            spread: true
        })
    },
    //   收起侧边栏
    packUp: function () {
        var that = this
        this.setData({
            spread: false
        })
    },
    //   toIndex
    toIndex: function () {
        var that = this
        wx.reLaunch({
            url: '/pages/index/index',
        })
        this.setData({
            spread: false
        })
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
    contact: function () {
        var that = this
        wx.makePhoneCall({
            phoneNumber: that.data.company_tel
        })
        this.setData({
            spread: false
        })
    },
    openLocatioin: function () {
        var that = this
        wx.openLocation({
            longitude: parseFloat(that.data.longitude),
            latitude: parseFloat(that.data.latitude)
        })
        this.setData({
            spread: false
        })
    },
    onPullDownRefresh: function () {
        var that = this
        getCompMsg(that)
    },
    onShareAppMessage: function () {
        var that = this
        return {
            title: app.globalData.title ? app.globalData.title : '梦想墙',
            path: '/pages/mxq2/comp/comp?share=true',
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
function getCompMsg(that) {
    var code = app.globalData.code;
    wx.request({
        url: url + '/dream/index/company.json?customer_id=' + customer_id,
        method:'POST',
        data:{
            customer_id:customer_id,
            sign: md5.md5('customer_id=' + customer_id+code)
        },
        success: (res) => {
            // console.log(res)
            if (res.data.ret == 200) {
                var data = res.data.data
                that.setData({
                    address: data.address,
                    location: data.address,
                    company_name: data.company_name,
                    company_tel: data.company_tel,
                    introduce: data.introduce.replace(/&nbsp;/g, '\xa0'),
                    latitude: data.latitude,
                    longitude: data.longitude,
                    markers: [{
                        latitude: data.latitude,
                        longitude: data.longitude,
                        iconPath: '',
                        callout: {
                            content: data.company_name + '<br/>' + data.address,
                            color: '#666',
                            fontSize: '20rpx',
                            borderRadius: '4px',
                            bgColor: '#fff',
                            padding: '15rpx',
                            display: 'ALWAYS'
                        }
                    }]
                })
                if (wx.setNavigationBarTitle) {
                    wx.setNavigationBarTitle({
                        title: data.company_name,
                    })
                }
                wx.hideLoading()
            } else {
                console.log(res)
                wx.showToast({
                    title: '获取公司信息失败',
                    image: '/images/fail.png'
                })
                setTimeout(function () {
                    wx.reLaunch({
                        url: '/pages/index/index',
                    })
                }, 1000)
                wx.hideLoading()
            }
        },
        fail: (res) => {
            console.log(res)
            wx.showToast({
                title: '获取公司信息失败',
                image: '/images/fail.png'
            })
            setTimeout(function () {
                wx.reLaunch({
                    url: '/pages/index/index',
                })
            }, 1000)
            wx.hideLoading()
        },
        complete: function () {
            wx.hideLoading()
            wx.stopPullDownRefresh()
        }
    })
}
function getStatus(app, callback) {
    wx.request({
        url: url + '/sign.json?customer_id='+customer_id,
        method: 'POST',
        success: (res) => {
            if (res.data.ret == 200) {
                var code = res.data.data.code
                app.globalData.code = res.data.data.code
                wx.request({
                    url: url + '/dream/index/setting.json?customer_id=' + customer_id,
                    method: 'POST',
                    data: {
                        customer_id: customer_id,
                        sign: md5.md5('customer_id=' + customer_id + res.data.data.code)
                    },
                    success: (res) => {
                        // console.log(res)
                        if (res.data.ret == 200) {
                            var data = res.data.data
                            // console.log(data);
                            app.globalData.title = data.title;
                            app.globalData.status = data.themes;
                            app.globalData.musicSrc = data.is_music_url;
                            app.globalData.wish_name = data.wish_name;
                            app.globalData.playing = data.is_music == 1 ? true : false
                            // console.log(that.globalData)
                            if (callback) {
                                callback()
                            }
                        }
                    },
                    fail: (res) => {
                        wx.showToast({
                            title: '基本设置失败',
                            image: '/images/fail.png'
                        })
                        console.log(res)
                    }
                })
            } else {
                wx.showToast({
                    title: '获取风格失败',
                    image: '/images/fail.png'
                })
                app.globalData.status = 1
            }
        },
        fail: (res) => {
            console.log(res)
            wx.showToast({
                title: '获取风格失败',
                image: '/images/fail.png'
            })
            app.globalData.status = 1
        }
    })
}
//  get Id
function getId(that, callback) {
    var myCode;
    var sign;
    var head;
    var nickname;
    var code;
    wx.request({
        url: url + '/sign.json?customer_id='+customer_id,
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
                                        } else if (res.data.ret == 100) {
                                            wx.showToast({
                                                title: res.data.msg,
                                                image: '/images/fail.png',
                                                duration: 5000
                                            })
                                            setTimeout(function () {
                                                wx.navigateBack({
                                                    delta: 0
                                                })
                                            }, 5000)
                                        } else {
                                            app.globalData.openid = ''
                                            wx.hideLoading()
                                            wx.showToast({
                                                title: res.data.msg,
                                                image: '/images/fail.png'
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
                                    },
                                    complete: function () {
                                        wx.hideLoading()
                                    }
                                })
                            },
                            fail: (res) => {
                                app.globalData.head = ''
                                app.globalData.nickname = ''
                                app.globalData.openid = ''
                            },
                            complete: function () {
                                wx.hideLoading()
                            }
                        })

                    },
                    fail: (res) => {
                        wx.hideLoading()
                        wx.showToast({
                            title: '登录失败', res,
                        })
                        app.globalData.openid = ''
                    },
                    complete: function () {
                        wx.hideLoading()
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
        },
        complete: function () {
            wx.hideLoading()
        }
    })
    // }
}