// pages/mxq1/mxdetail/mxdetail.js
var app = getApp()
var url = require('../../../utils/util.js').url
var http_host = require('../../../utils/util.js').http_host
var md5 = require('../../../utils/md.js');
var customer_id = require('../../../utils/custom.js').customer_id
var trim = require('../../../utils/util.js').trim
var plList = [];    //评论列表
var details;    //梦想详情
var content = ''; //评论详情
var id; //梦想id
var openid;  //用户id
var code;   //code
Page({
    /**
     * 页面的初始数据
     */
    data: {
        spread: false,  //展开
        details: null,  //梦想详情
        playing: app.globalData.playing,    //音乐播放状态
        plList: [],      //评论列表
        plCount: 0,       //评论数量
        content: '',
        likeUser: [],
        reply: false,
        replayName: '',
        replayId: 0,
        replyContent: '',
        dream_id: 0,
        user_id: 0,
        page: 1,
        is_anonymous: true,
        hideName: false,
        likeCount:0,
        http_host: http_host,
        bigimg: false,
        bigimgsrc: '',
        id:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        id = parseInt(options.id)
        that.setData({
            dream_id: parseInt(options.id),
            page: 1,
            is_anonymous: app.globalData.is_anonymous,
            user_id: app.globalData.user_id,
            id:id
        })
        if (options.share) {
            if (app.globalData.openid == '' || app.globalData.code == '') {
                getId(that, function (newId) {
                    if (newId == -1) {
                        return
                    } else {
                        code = app.globalData.code
                        getContent(id, newId, code, that);
                        getList(id, code, that);
                    }
                })
            } else {
                openid = app.globalData.openid
                code = app.globalData.code
                if (openid == -1) {
                    return
                } else {
                    getContent(id, openid, code, that);
                    getList(id, code, that);
                }
            }

        } else {
            that.setData({
                playing: app.globalData.playing,
                user_id: app.globalData.user_id,
                id: options.id
            })
            openid = app.globalData.openid
            code = app.globalData.code
            if (openid == -1) {
                return
            } else {
                getContent(id, openid, code, that);
                getList(id, code, that);
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
        var that = this
        this.setData({
            playing: app.globalData.playing,
            backgroundUrl: app.globalData.backgroundUrl,
            hideMusic: app.globalData.hideMusic,
            url: url
        })
        
	if (wx.setNavigationBarTitle) {
            wx.setNavigationBarTitle({
                title: app.globalData.title ? app.globalData.title : '详情',
            })
        }
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
    //   focus
    focus: function () {
        this.setData({
            focus: true
        })
    },
    hideForm: function () {
        this.setData({
            focus: false,
            reply: false
        })
    },
    // confirm
    confirm: function (e) {
        var that = this;
        that.setData({
            content: trim(e.detail.value)
        })
    },
    // reply_inp 
    reply_inp: function (e) {
        var that = this;
        that.setData({
            replyContent: trim(e.detail.value)
        })
    },
    //   to index
    toIndex: function () {
        wx.reLaunch({
            url: '../../index/index',
        })
        this.setData({
            spread: false
        })
    },
    // tocomp
    toComp: function () {
        wx.navigateTo({
            url: '../comp/comp',
        })
        this.setData({
            spread: false
        })
    },
    // tolists
    toLists: function (e) {
        var that = this
        var listId = e.currentTarget.dataset.id
        // console.log(e)
        wx.navigateTo({
            url: '../likelist/likelist?id=' + listId + '&likeCount=' + that.data.likeCount,
        })
        this.setData({
            spread: false
        })
    },
    //  ====================================================================make like
    makeLike: function (e) {
        // console.log(e.currentTarget.dataset.id)
        var that = this
        var id = e.currentTarget.dataset.id
        var openid = app.globalData.openid;
        var code = app.globalData.code;
        if (openid == '') {
            wx.showModal({
                title: '是否打开设置页面重新授权',
                content: '需要获取您的公开信息(昵称，头像等),请到小程序的设置中打开用户信息授权',
                confirmText: '去设置',
                success: (res) => {
                    if (res.confirm) {
                        wx.openSetting({
                            success: function (res) {
                                if (res.authSetting["scope.userInfo"]) {
                                    var code = app.globalData.code;
                                    getId(that, function (newId) {
                                        makeLike(newId, openid, code, that)
                                    })
                                } else {
                                    wx.showToast({
                                        title: '未获得授权',
                                        image: '/images/fail.png'
                                    })
                                }
                            }
                        })
                    }
                }
            })
        } else {
            makeLike(id, openid, code, that)
        }

    },
    //  hideName
    hideName: function () {
        this.setData({
            hideName: !this.data.hideName
        })
    },
    // submit
    submit: function () {
        var that = this;
        // console.log(openid,id,code)
        openid = app.globalData.openid
        code = app.globalData.code
        // id = parseInt(options.id)
        content = that.data.content
        if (openid == '') {
            wx.showModal({
                title: '是否打开设置页面重新授权',
                content: '需要获取您的公开信息(昵称，头像等),请到小程序的设置中打开用户信息授权',
                confirmText: '去设置',
                success: (res) => {
                    if (res.confirm) {
                        wx.openSetting({
                            success: function (res) {
                                if (res.authSetting["scope.userInfo"]) {
                                    getId(that, function (newId) {
                                        getId(that, function (res) {
                                            if (content == '') {
                                                wx.showToast({
                                                    title: '请输入评论',
                                                })
                                            } else {
                                                comment(res, id, code, content, that);
                                                that.setData({
                                                    focus: false
                                                })
                                            }

                                        })
                                    })
                                } else {
                                    wx.showToast({
                                        title: '未获得授权',
                                        image: '/images/fail.png'
                                    })
                                }
                            }
                        })
                    }
                }
            })

        } else if (openid == -1) {
            wx.showToast({
                title: '你没有访问梦想墙的权限',
                image: '/images/fail.png',
                duration: 3000
            })
            setTimeout(function () {
                wx.reLaunch({
                    url: '/pages/index/index',
                })
            }, 3000)
        } else {
            if (content == '') {
                wx.showToast({
                    title: '请输入评论',
                })
            } else {
                comment(openid, id, code, content, that);
                that.setData({
                    focus: false
                })
            }

        }
    },
    replyFocus: function (e) {
        var that = this;
        that.setData({
            replayName: e.target.dataset.name,
            replyId: e.target.dataset.id,
            reply: true
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
    // reply
    reply: function () {
        var that = this
        var reply_id = that.data.replyId;
        var reply_name = that.data.replayName;
        var content = that.data.replyContent;
        var dream_id = id
        openid = app.globalData.openid
        if (openid == '') {
            wx.showModal({
                title: '是否打开设置页面重新授权',
                content: '需要获取您的公开信息(昵称，头像等),请到小程序的设置中打开用户信息授权',
                confirmText: '去设置',
                success: (res) => {
                    if (res.confirm) {
                        wx.openSetting({
                            success: (res) => {
                                if (res.authSetting["scope.userInfo"]) {
                                    getId(that, function (newId) {
                                        getId(that, function (res) {
                                            if (content == '') {
                                                wx.showToast({
                                                    title: '请输入回复内容',
                                                })
                                            } else {
                                                reply(openid, dream_id, reply_id, reply_name, content, code, that)
                                                that.setData({
                                                    focus: false
                                                })
                                            }

                                        })
                                    })
                                } else {
                                    wx.showToast({
                                        title: '未获得授权',
                                        image: '/images/fail.png'
                                    })
                                }
                            }
                        })
                    }

                }
            })
        } else if (openid == -1) {
            wx.showToast({
                title: '你没有访问梦想墙的权限',
                image: '/images/fail.png',
                duration: 3000
            })
            setTimeout(function () {
                wx.reLaunch({
                    url: '/pages/index/index',
                })
            }, 3000)
        } else {
            if (content == '') {
                console.log('in')
                wx.showToast({
                    title: '请输入评论',
                })
            } else {
                reply(openid, dream_id, reply_id, reply_name, content, code, that)
            }

        }

    },
    // ====================================================== deletPl
    deletPl: function (e) {
        var that = this
        // console.log(e.target.dataset.id);
        var openid = app.globalData.openid
        var id = e.target.dataset.id
        var code = app.globalData.code;
        var dream_id = that.data.dream_id
        wx.showModal({
            title: '删除提示',
            content: '确认删除此评论？',
            confirmColor: '#4d4a9a',
            success: function (res) {
                if (res.confirm) {
                    deletPl(openid, id, code, that, dream_id)
                } else {
                    return;
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '操作失败，请重试',
                    image: '/images/fail.png'
                })
            }
        })

    },
    // ====================================================== 删除梦想
    del: function (e) {
        // console.log(e.currentTarget.dataset.id)
        var id = e.currentTarget.dataset.id
        var openid = app.globalData.openid
        var code = app.globalData.code
        var that = this
        wx.showModal({
            title: '删除提示',
            content: '确认删除此' + app.globalData.dream_name + '？',
            confirmColor: '#4d4a9a',
            success: (res) => {
                if (res.confirm) {
                    del(id, openid, code, that)
                } else {
                    return
                }
            }
        })

    },
    //  ====================================================== newList
    hotOrder: function () {
        var that = this;
        var id = that.data.dream_id
        var code = app.globalData.code
        that.setData({
            page: 1
        })
        getList(id, code, that)
        that.setData({
            spread: false
        })
    },
    //  prevImg
    prevImg: function (e) {
      var that = this;
      // var current = e.currentTarget.dataset.src
      // var urls = [e.currentTarget.dataset.src]
      // // console.log(current,urls)
      // wx.previewImage({
      //     current: current,
      //     urls: [current],
      //     success: (res) => {
      //         // console.log('s:',res)
      //     },
      //     fail: (res) => {
      //         // console.log('f:',res)
      //     }
      // })
      that.setData({
        bigimg: true,
        bigimgsrc: e.currentTarget.dataset.src
      })
    },
    bigimgclose: function () {
      this.setData({
        bigimg: false,
      })
    },
    onPullDownRefresh: function () {
        var that = this
        that.setData({
            page: 1
        })
        var openid = app.globalData.openid
        var code = app.globalData.code
        var id = parseInt(that.data.id)
        getContent(id, openid, code, that);
        getList(id, code, that);
    },
    onShareAppMessage: function () {
        var that = this
        return {
            title: app.globalData.title ? app.globalData.title : '梦想墙',
            path: '/pages/mxq4/mxdetail/mxdetail?id=' + that.data.id + '&share=true',
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
    },
    onReachBottom: function () {
        var that = this
        if (that.data.plList.length >= 10 && that.data.plList.length % 10 == 0) {
            that.setData({
                page: that.data.page + 1
            })
            loadMore(that)
        }
    }
})
//  ================================================================          获取梦想内容
function getContent(id, openid, code, that) {
    if (openid == -1) {
        wx.showToast({
            title: '您没有访问梦想墙的权限',
            image: '/images/fail.png'
        })
    } else {
        wx.request({
            url: url + '/dream/index/detail.json?customer_id=' + customer_id,
            method: 'POST',
            data: {
                customer_id: customer_id,
                openid: openid,
                id: id,
                sign: md5.md5('customer_id=' + customer_id + '&id=' + id + '&openid=' + openid + code)
            },
            success: (res) => {
                // console.log('content', res)
                if (res.data.data.ret == 200) {
                    res.data.data.dream = toGB(res.data.data.dream)
                    that.setData({
                        details: res.data.data
                    })
                    var data = res.data.data
                    if (data.likes_user != []) {
                        var likes = data.likes_user
                        // console.log('likes',likes)
                        var list = []
                        for (var i = 0; i < 3; i++) {
                            if (likes[i]) {
                                likes[i].index = i + 1;
                                list.push(likes[i])
                            }
                        }
                        // console.log(list)
                        that.setData({
                            likeUser: list,
                            likeCount: data.likes
                        })
                    }
                } else {
                    console.log(res)
                    wx.showToast({
                        title: res.data.data.msg,
                        image: '/images/fail.png',
                        duration: 3000
                    })
                    setTimeout(function () {
                        wx.reLaunch({
                            url: '../../index/index',
                        })
                    }, 3000)
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.errMsg,
                    image: '/images/fail.png',
                    duration: 3000
                })
                setTimeout(function () {
                    wx.redirectTo({
                        url: '../../index/index',
                    })
                }, 3000)
                console.log(res)
            }
        })
    }

}
//  ========================================================================  获取评论列表
function getList(id, code, that, callback) {
    if (that.data.openid == -1) {
        wx.showToast({
            title: '您没有访问梦想墙的权限',
            image: '/images/fail.png'
        })
    } else {
        wx.request({
            url: url + '/dream/index/comments.json?customer_id=' + customer_id,
            method: 'POST',
            data: {
                customer_id: customer_id,
                id: id,
                sign: md5.md5('customer_id=' + customer_id + '&id=' + id + code)
            },
            success: (res) => {
                // console.log('pl',res)
                if (res.data.ret == 200) {    //请求成功
                    var data = res.data.data.data;
                    for (var i = 0; i < data.length; i++) {
                        data[i].content = toGB(data[i].content)
                    }
                    that.setData({
                        plList: data,
                        plCount: res.data.data.total
                    })
                    if (callback) {
                        callback()
                    }
                } else {
                    wx.showToast({
                        title: '获取评论列表失败',
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.errMsg,
                    image: '/images/fail.png'
                })
                // console.log(res)
            },
            complete: function (res) {
                // console.log('pl res', res)
                wx.stopPullDownRefresh()
            }
        })
    }
}
//  ========================================================================  发表评论
function comment(openid, id, code, content, that) {
    // console.log(id)
    var anonymous = that.data.hideName ? 1 : 0
    if (content == '') {
        wx.showToast({
            title: '请输入评论内容',
        })
    } else {
        wx.request({
            url: url + '/dream/user/comments.json?customer_id=' + customer_id,
            method: 'POST',
            data: {
                anonymous: anonymous,
                customer_id: customer_id,
                dream_id: id,
                openid: openid,
                content: content,
                sign: md5.md5('anonymous=' + anonymous + '&customer_id=' + customer_id + '&dream_id=' + id + '&openid=' + openid + code)
            },
            success: (res) => {
                if (res.data.ret == 200) {
                    that.setData({
                        page: 1,
                        anonymous: false,
                        hideName: false
                    })
                    wx.showToast({
                        title: '评论成功',
                    })
                    getList(id, code, that)
                } else {
                    console.log(res)
                    wx.showToast({
                        title: '评论失败' + res.data.msg,
                        image: '/images/fail.png'
                    })
                }
            },
            fail: (res) => {
                console.log(res)
                wx.showToast({
                    title: '操作失败' + res,
                    image: '/images/fail.png'
                })
            },
            complete: (res) => {
                wx.hideLoading()
                wx.stopPullDownRefresh()
            }
        })
    }
}

// ========================================================================   点赞
function makeLike(id, openid, code, that) {
    wx.request({
        url: url + '/dream/user/likes.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id: customer_id,
            openid: openid,
            dream_id: id,
            sign: md5.md5('customer_id=' + customer_id + '&dream_id=' + id + '&openid=' + openid + code)
        },
        success: (res) => {
            //  console.log(res)
            if (res.data.ret == 200) {
                that.setData({
                    likedId: id
                })
                wx.showToast({
                    title: '点赞成功',
                })
                getContent(id, openid, code, that)
            } else {
                console.log(res)
                wx.showToast({
                    title: res.data.msg,
                    image: '/images/fail.png'
                })
            }
        },
        fail: (res) => {
            wx.showToast({
                title: '请求失败',
            })
        }
    })
}
// ======================================================================      回复
function reply(openid, dream_id, reply_id, reply_name, content, code, that) {
    // console.log(openid, id, reply_id, reply_name, content, code)
    var anonymous = that.data.hideName ? 1 : 0
    wx.request({
        url: url + '/dream/user/comments.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            anonymous: anonymous,
            customer_id: customer_id,
            content: content,
            dream_id: dream_id,
            openid: openid,
            reply_name: reply_name,
            reply_id: reply_id,
            sign: md5.md5('anonymous=' + anonymous + '&customer_id=' + customer_id + '&dream_id=' + dream_id + '&openid=' + openid + '&reply_id=' + reply_id + code)
        },
        success: function (res) {
            // console.log(res)
            if (res.data.ret == 200) {
                that.setData({
                    page: 1,
                    anonymous: false,
                    hideName: false
                })
                wx.showToast({
                    title: '评论成功',
                })
                getList(id, code, that)
            }
        },
        fail: function (res) {
            console.log(res)
            wx.showToast({
                title: '操作失败' + res.data,
            })
        },
        complete: function () {
            that.setData({
                reply: false
            })
            wx.hideLoading()
        }
    })
}
//  =====================================================================      删除评论
function deletPl(openid, id, code, that, dream_id) {
    wx.request({
        url: url + '/dream/user/commentsdel.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id: customer_id,
            id: id,
            openid: openid,
            sign: md5.md5('customer_id=' + customer_id + '&id=' + id + '&openid=' + openid + code)
        },
        success: (res) => {
            // console.log(res)
            if (res.data.ret == 200) {
                wx.showToast({
                    title: '删除成功',
                })
                that.setData({
                    page: 1
                })
                getList(dream_id, code, that)
            }
        },
        fail: (res) => {
            wx.showToast({
                title: '删除失败' + res.data,
            })
        }
    })
}
//  ========================================================================   删除梦想
function del(id, openid, code, that) {
    wx.request({
        url: url + '/dream/user/delete.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id: customer_id,
            dream_id: id,
            openid: openid,
            sign: md5.md5('customer_id=' + customer_id + '&dream_id=' + id + '&openid=' + openid + code)
        },
        success: (res) => {
            // console.log(res)
            if (res.data.ret == 200) {
                wx.showToast({
                    title: '删除成功',
                })
                setTimeout(function () {
                    wx.reLaunch({
                        url: '/pages/index/index',
                    })
                }, 1500)
            } else {
                console.log(res)
                wx.showToast({
                    title: '操作失败',
                    image: '/images/fail.png'
                })
            }
        },
        fail: (res) => {
            wx.showToast({
                title: res,
            })
            console.log(res)
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
        },
        complete: function () {
            wx.hideLoading()
        }
    })
    // }
}
//  loadmore 
function loadMore(that) {
    if (that.data.openid == -1) {
        wx.showToast({
            title: '您没有访问梦想墙的权限',
            image: '/images/fail.png'
        })
    } else {
        var list = that.data.plList
        wx.request({
            url: url + '/dream/index/comments.json?customer_id=' + customer_id,
            method: 'POST',
            data: {
                customer_id: customer_id,
                id: that.data.dream_id,
                page: that.data.page,
                sign: md5.md5('customer_id=' + customer_id + '&id=' + that.data.dream_id + '&page=' + that.data.page + app.globalData.code)
            },
            success: (res) => {
                // console.log(res)
                if (res.data.ret == 200) {
                    for (var i = 0; i < res.data.data.data.length; i++) {
                        res.data.data.data[i].content = toGB(res.data.data.data[i].content)
                        list.push(res.data.data.data[i])
                    }
                    that.setData({
                        plList: list
                    })
                    // console.log(that.data.plList,list)
                } else {
                    wx.showToast({
                        title: res.data.msg,
                        image: '/images/fail.png'
                    })
                }
            },
            fail: (res) => {
                console.log(res)
                wx.showToast({
                    title: '加载失败',
                    image: '/images/fail.png'
                })
            }
        })
    }
}

function toUnitoUnicode(str) {
    return str
}
function toGB(str) {
    return unescape(str.replace(/\\u/gi, '%u'));
}
function getStatus(that, app, callback) {
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
                            // console.log(data)
                            app.globalData.title = data.title;
                            app.globalData.status = data.themes;
                            app.globalData.musicSrc = data.is_music_url;
                            app.globalData.wish_name = data.wish_name;
                            app.globalData.playing = data.is_music == 1 ? true : false
                            app.globalData.is_anonymous = data.is_anonymous == 1 ? true : false
                            app.globalData.dream_name = data.dream_name
                            app.globalData.backgroundUrl = data.backgrund_url
                            that.setData({
                                dream_name: data.dream_name,
                                musicSrc: data.is_music_url,
                                hasStatus: true,
                                status: data.themes, // data.themes
                                wish_name: data.wish_name,
                                is_anonymous: data.is_anonymous == 1 ? true : false,
                                tx: data.is_special,//data.is_special
                                backgroundUrl: data.backgrund_url
                            })
                            // console.log(that.data.backgroundUrl)
                            if (callback) {
                                callback(app)
                            }
                        }
                    },
                    fail: (res) => {
                        wx.showToast({
                            title: '基本设置失败' + res.errMsg,
                            image: '/images/fail.png'
                        })
                        console.log(res)
                    }
                })
            } else {
                wx.showToast({
                    title: '获取风格失败' + res.errMsg,
                    image: '/images/fail.png'
                })
                app.globalData.status = 1
                app.globalData.wish_name = '梦想墙'
            }
        },
        fail: (res) => {
            console.log(res)
            wx.showToast({
                title: '获取风格失败' + res.errMsg,
                image: '/images/fail.png'
            })
            app.globalData.status = 1
            app.globalData.wish_name = '梦想墙'
        }
    })
}