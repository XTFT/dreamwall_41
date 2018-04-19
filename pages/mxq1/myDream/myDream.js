// pages/mxq1/myDream/myDream.js
var app = getApp(); //获取APP实例
var url = require('../../../utils/util.js').url
var getOpenId = require('../../../utils/util.js').getOpenId
var http_host = require('../../../utils/util.js').http_host
var md5 = require('../../../utils/md.js')
var customer_id = require('../../../utils/custom.js').customer_id
var getStatus = require('../../../utils/util.js').getStatus
var code;
var openid;
var list = []
Page({
    /**
     * 页面的初始数据
     */
    data: {
        add: false,
        hideName: false,
        imgSrc: '',
        dreamList:[],
        playing:app.globalData.playing,
        likeUser:[],
        sort:'create_time',
        page:1,
        http_host: http_host
    },
    onLoad: function (options) {
        var that = this
        // console.log(options.id)
        var id = options.id
        if(options.share){
            that.setData({
                share:true
            })
        }
        this.setData({
            playing: app.globalData.playing,
            openid:options.id,
        })
        if(options.share){
            that.setData({
                share:true
            })
            getId(that,function(newId){
                getList(newId, app.globalData.code, that)
                if (that.data.sort == 'create_time') {
                    that.setData({
                        sort: 'likes',
                        spread: false
                    })
                } else {
                    that.setData({
                        sort: 'create_time',
                        spread: false
                    })
                }
            })
        }else{
            getList(id, app.globalData.code, that)
            if (that.data.sort == 'create_time') {
                that.setData({
                    sort: 'likes',
                    spread: false
                })
            } else {
                that.setData({
                    sort: 'create_time',
                    spread: false
                })
            }
        }
    },
    onReady: function () {

    },
    onShow: function () {
        this.setData({
            playing: app.globalData.playing,
            page:1,
            dream_name: app.globalData.dream_name,
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
        if(wx.setNavigationBarTitle){
            wx.setNavigationBarTitle({
                title: '我的' + app.globalData.title ? app.globalData.title : '',
            })
        }
        if(!app.globalData.hideMusic && app.globalData.playing){
            wx.onBackgroundAudioStop(function () {
                wx.playBackgroundAudio({
                    dataUrl: app.globalData.musicSrc,
                })
            })
        }
        
    },
    spread: function () {
        this.setData({
            spread: true
        })
    },
    //   收起侧边栏
    packUp: function () {
        this.setData({
            spread: false
        })
    },
 
    //   许愿
    addDream: function () {
        this.setData({
            add: true
        })
    },
    //   收起输入框
    hideForm: function (e) {
        this.setData({
            add: false
        })
    },
    //  todetails 
    toDetails:function(e){
        // console.log(e.target.dataset.id);
        wx.navigateTo({
            url: '../mxdetail/mxdetail?id=' + e.target.dataset.id,
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
    // toIndex 
    toIndex:function(){
        var that = this
        if(that.data.share){
            wx.reLaunch({
                url: '../../index/index',
            })
        }else{
            wx.navigateBack({
                
            })
        }
    },
    toComp:function(){
        this.setData({
            spread:false
        })
        wx.navigateTo({
            url: '../comp/comp',
        })
    },
    toList:function(e){
        // console.log(e.currentTarget.dataset.id)
        wx.navigateTo({
            url: '../likelist/likelist?id=' + e.currentTarget.dataset.id + '&likeCount=' + e.currentTarget.dataset.likecount,
        })
    },
    //  sort
    sort:function(){
        var that = this
        var openid = that.data.openid
        var code = app.globalData.code
        if (that.data.sort == 'create_time') {
            getList(openid, code, that)
            that.setData({
                sort:'likes',
                spread:false
            })
        } else {
            getList(openid, code, that)
            that.setData({
                sort:'create_time',
                spread: false
            })
        }
    },

    //  ============================================================== del
    del:function(e){
        var that = this
        var dreamid = e.target.dataset.id
        var openid = app.globalData.openid
        var code = app.globalData.code
        wx.showModal({
            title: '提示',
            content: '确认删除此' + app.globalData.dream_name + '？',
            confirmColor: '#4d4a99',
            success: function (res) {
                if (res.confirm) {
                    del(openid, dreamid, code, that)
                } else {
                   
                }
            }
        })
    },
    //  =============== load more
    onReachBottom:function(){
        var that = this
        var openid = that.data.openid
        var code = app.globalData.code
        if(that.data.dreamList.length % 10 == 0){
            that.setData({
                page:that.data.page + 1
            })
            loadMore(openid, code,that)
        }else{
            wx.showToast({
                title: '没有更多了',
            })
        }
    },
    onPullDownRefresh:function(){
        var that = this
        var openid = app.globalData.openid
        var code = app.globalData.code
        that.setData({
            sort:'create_time'
        })
        getList(openid, code, that)
    },
    onShareAppMessage: function () {
        var that = this
        return {
            title:'我的',
            path: '/pages/mxq1/myDream/myDream?share=true',
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
// ===================================================== 获取梦想列表
function getList(openid,code,that){
    // console.log(openid,code)
    wx.request({
        url: url + '/dream/index/my.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id: customer_id,
            openid: openid,
            // page:1,
            pagesize: 10,
            sort: that.data.sort,
            sign: md5.md5('customer_id=' + customer_id + '&openid=' + openid + '&pagesize=10' + '&sort=' + that.data.sort + code) //+ '&page=' + 1 + '&pagesize=' + 10 +'&sort=create_time'
        },
        success: (res) => {
            // console.log(res)
            if (res.data.ret == 200) {
                var data = res.data.data
                // console.log(data)
                for (var i = 0; i < data.length; i++) {
                    data[i].dream = toGB(data[i].dream)
                    if (data[i].likes != 0) {
                        for (var j = 0; j < 3; j++) {
                            if (data[i].likes_user[j]) {
                                data[i].likes_user[j].index = j + 1;
                            }
                        }
                    }
                }
                console.log(data)
                if (data.length == 0 ||data == []) {
                    if(that.data.share){
                        wx.showToast({
                            title:'您还没有许愿',
                        })
                    }
                    setTimeout(function () {
                        wx.reLaunch({
                            url: '../../index/index',
                        })
                    }, 2000)

                } else {
                    that.setData({
                        dreamList: data
                    })
                    wx.pageScrollTo({
                        scrollTop: 0,
                    })
                }
            } else {
                wx.showToast({
                    title: '请求失败',
                    image: '/images/fail.png'
                })
                that.setData({
                    dreamList: []
                })
                setTimeout(function(){
                    wx.reLaunch({
                        url: '../../index/index',
                    })
                },2000)
            }
        },
        fail: (res) => {
            wx.showToast({
                title: '请求错误',
            })
            console.log(res)
        },
        complete: (res) => {
            wx.stopPullDownRefresh()
        }
    })
}
//  ==================================================== 删除梦想
function del(openid, dreamid, code, that) {
    wx.request({
        url: url + '/dream/user/delete.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id: customer_id,
            openid: openid,
            dream_id: dreamid,
            sign: md5.md5('customer_id=' + customer_id + '&dream_id=' + dreamid + '&openid=' + openid + code)
        },
        success: (res) => {
            // console.log(res)
            if (res.data.ret == 200) {
                wx.showToast({
                    title: '删除成功',
                })
                getList(openid, code, that)
                wx.pageScrollTo({
                    scrollTop: 0
                })
            } else {
                wx.showToast({
                    title: "操作失败:" + res.data,
                })
                return;
            }
        },
        fail: (res) => {
            console.log(res)
            wx.showToast({
                title: '操作失败',
                image: '/images/fail.png'
            })
        }
    })
}
//  =================================================== load more
function loadMore(openid,code,that){
    if(openid == -1){
        wx.showToast({
            title: '您没有访问梦想墙的权限',
            image:'/images/fail.png'
        })
    }else{
        var list = that.data.dreamList
        // console.log(that.data.page)
        wx.request({
            url: url + '/dream/index/my.json?customer_id=' + customer_id,
            method: 'POST',
            data: {
                customer_id: customer_id,
                openid: openid,
                page: that.data.page,
                pagesize: 10,
                sort: that.data.sort,
                sign: md5.md5('customer_id=' + customer_id + '&openid=' + openid + '&page=' + that.data.page + '&pagesize=10' + '&sort=' + that.data.sort + code)
            },
            success: (res) => {
                // console.log(res)
                if (res.data.ret == 200) {
                    var data = res.data.data
                    for (var i = 0; i < data.length; i++) {
                        data[i].dream = toGB(data[i].dream)
                        list.push(data[i])
                    }
                    // console.log(list,data)
                    that.setData({
                        dreamList: list
                    })
                } else {
                    wx.showToast({
                        title: '获取更多失败:' + res.errMsg,
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '请求错误',
                })
                console.log(res)
            }
        })
    }
    
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
                                        console.log('登录res:', res)
                                        if (res.data.ret == 200) {
                                            app.globalData.openid = res.data.data.openid
                                            app.globalData.user_id = res.data.data.user_id
                                            that.setData({
                                                user_id: res.data.data.user_id
                                            })
                                            if (callback) {
                                                callback(res.data.data.openid)
                                            }
                                        } else if (res.data.ret == 100) {
                                            that.setData({
                                                openid: -1
                                            })
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
                                    }
                                })
                            },
                            fail: (res) => {
                                app.globalData.head = ''
                                app.globalData.nickname = ''
                                app.globalData.openid = ''
                                wx.showToast({
                                    title: '获取个人信息失败',
                                })
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
}
function toUnicode(str) {
    return escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
}
function toGB(str) {
    return unescape(str.replace(/\\u/gi, '%u'));
}
