// pages/first/first.js
var app = getApp(); //获取APP实例
var url = require('../../utils/util.js').url
var http_host = require('../../utils/util.js').http_host
var md5 = require('../../utils/md.js')
var customer_id = require('../../utils/custom.js').customer_id
var trim = require('../../utils/util.js').trim
var page = 1;
var leftList = [];
var rightList = [];
Page({
	data: {
		userInfo: app.globalData.userInfo,
		playing: app.globalData.playing, //背景乐播放 true
		status: app.globalData.status,   //模板
		spread: false,   //展开 false
		add: false, // 发表表单不显示
		hideName: false, //是否匿名 默认否
		imgSrc: '', //添加的图片路径
		dream: '',//梦想内容
		hotOrder: true, //热门排序
		leftList: [],//左侧列表
		rightList: [],    //右侧列表
		head: app.globalData.head,
		nickname: app.globalData.nickname,
		openid: app.globalData.openid,
		code: app.globalData.code,
		user_id: app.globalData.user_id,
		page: 1,
		r_left: 0,
		r_top: 0,
		l_left: 0,
		l_top: 0,
		rightTips: false,
		leftTip: false,
		wish_name: '许愿',
		loading: '',
		leftCount:false,
    bigimg:false,
    bigimgsrc:'',
		rightCount:false,
        tx:0,
        dream_name:'',
        http_host:http_host
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// console.log(customer_id)
        var time = new Date()
		var that = this;
		that.setData({
			page: 1,
		})
        getStatus(that, app, function (app) {
            // console.log(app.globalData.playing,app.globalData.musicSrc)
            if (app.globalData.playing == true && app.globalData.hideMusic == false) {
                setTimeout(function () {
                    // console.log(app.globalData.musicSrc)
                    wx.playBackgroundAudio({
                        dataUrl: app.globalData.musicSrc,
                        success: (res) => {
                            // console.log(res)
                            that.setData({
                                playing:true,
                            })
                            app.globalData.playing = true
                        },
                        fail: (res) => {
                            app.globalData.playing == false
                            that.setData({
                                playing: false
                            })
                        }
                    })
                }, 1000)
            }else{
                app.globalData.playing = false
                that.setData({
                    playing:false,
                    hideMusic:true
                })
                wx.stopBackgroundAudio()
            }
            setTimeout(function(){
                if (that.data.status == 1) {
                    if (wx.setNavigationBarColor) {
                        // console.log('in')
                        wx.setNavigationBarColor({
                            frontColor: '#ffffff',
                            backgroundColor: '#4d4a9a'
                        })
                    }
                } else if (that.data.status == 2) {
                    if (wx.setNavigationBarColor) {
                        wx.setNavigationBarColor({
                            frontColor: '#ffffff',
                            backgroundColor: '#fbbf49'
                        })
                    }
                } else if (that.data.status == 3) {
                    if (wx.setNavigationBarColor) {
                        wx.setNavigationBarColor({
                            frontColor: '#000000',
                            backgroundColor: '#ffffff'
                        })
                    }

                } else if (that.data.status == 4) {
                    if (wx.setNavigationBarColor) {
                        wx.setNavigationBarColor({
                            frontColor: '#000000',
                            backgroundColor: '#ffffff'
                        })
                    }
                } else {
                    if (wx.setNavigationBarColor) {
                        // console.log('in')
                        wx.setNavigationBarColor({
                            frontColor: '#ffffff',
                            backgroundColor: '#4d4a9a'
                        })
                    }
                }
            },500)
            if (wx.setNavigationBarTitle) {
                wx.setNavigationBarTitle({
                    title: app.globalData.title
                })
            } else {
                // console.log('in2')
                return
            }

        })
        //  =========================================================== 获取 梦想列表
        getId(that, function () {
            that.setData({
                head: app.globalData.head,
                nickname: app.globalData.nickname,
                openid: app.globalData.openid
            });
            //  =========== 获取用户信息 及 id
            var head = app.globalData.head;
            var nickname = app.globalData.nickname;
            var openid = app.globalData.openid
            var code = app.globalData.code
            var sort = !that.data.hotOrder ? 'likes' : 'create_time'
            getList(sort, 1, 10, code, openid, that)
        })
	},
    onReady: function () {
		
	},
	onShow: function () {
		var that = this
		that.setData({
			playing: app.globalData.playing,
			wish_name: app.globalData.wish_name,
			musicSrc: app.globalData.musicSrc,
            url:url
		})
    
    
		// if(app.globalData)
        if(!app.globalData.hideMusic && app.globalData.isMusic){
            wx.onBackgroundAudioStop(function () {
                // console.log('in')
                wx.playBackgroundAudio({
                    dataUrl: app.globalData.musicSrc,
                })
            })
        }
        setTimeout(function(){
            if (app.globalData.openid == '' || that.data.openid == '') {
                // console.log('in')
                var head = app.globalData.head;
                var nickname = app.globalData.nickname;
                var openid = app.globalData.openid
                var code = app.globalData.code
                var sort = !that.data.hotOrder ? 'likes' : 'create_time'
                getList(sort, 1, 10, code, openid, that)
            }
        },1500)
        
	},
	//   返回顶部
	toTop: function () {
		if (wx.pageScrollTo) {
			wx.pageScrollTo({
				scrollTop: 0
			})
		} else {
			wx.showToast({
				title: '页面滚动失败',
				image:'/images/fail.png'
			})
		}
		this.setData({
			spread: false
		})
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
	//   匿名
	hideName: function () {
		if (app.globalData.is_anonymous){
			this.setData({
				hideName: !this.data.hideName
			})
		}else{
			this.setData({
				hideName:false
			})
		}
		
	},
	//   许愿
	addDream: function () {
		var that = this
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
	//   输入完成
	confirm: function (e) {
		var that = this;
        // console.log(trim(e.detail.value).length )

		that.setData({
            dream: trim(e.detail.value) 
		})
		// console.log(that.data.dream)
	},
	//   添加图片
	addPic: function () {
		var that = this;
		wx.chooseImage({
			count: 1,
			success: function (res) {
				var tempFilePaths = res.tempFilePaths
				that.setData({
					imgSrc: tempFilePaths
				})
        if (app.globalData.playing == true && app.globalData.hideMusic == false) {

          // console.log(app.globalData.musicSrc)
          wx.playBackgroundAudio({
            dataUrl: app.globalData.musicSrc,
            success: (res) => {
              // console.log(res)
              that.setData({
                playing: true,
              })
              app.globalData.playing = true
            },
            fail: (res) => {
              app.globalData.playing == false
              that.setData({
                playing: false
              })
            }
          })
        }
    
			},
		})
	},
	//    删除图片
	deletPic: function () {
        wx.showModal({
            title: '操作提示',
            content: '确认删除图片？',
            success:(res)=>{
                if(res.confirm){
                    this.setData({
                        imgSrc: ''
                    })
                }
            }
        })
		
	},
	// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&   发布梦想
	submit: function () {
		var that = this
		var openid = app.globalData.openid
		var dream = that.data.dream
		var dream_thumb = that.data.imgSrc[0] || '';
		// var dream_thumb = '';
		var anonymous = that.data.hideName ? 1 : 0
		var code = app.globalData.code
		if (openid == '') {
            wx.showModal({
                title: '是否打开设置页面重新授权',
                content: '需要获取您的公开信息(昵称，头像等),请到小程序的设置中打开用户信息授权',
                confirmText:'去设置',
                success:(res)=>{
                    if(res.confirm){
                        wx.openSetting({
                            success: function (res) {
                                if (res.authSetting["scope.userInfo"]) {
                                    getId(that, function (newId) {
                                        var code = app.globalData.code
                                        // console.log(newId,code)
                                        submit(newId, dream, dream_thumb, anonymous, code, that);
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
		}else {
			submit(openid, dream, dream_thumb, anonymous, code, that);
		}
	},
	//     ================================================================   点赞
	makeLike: function (e) {
		var that = this
		var id = e.target.dataset.id;
		var openid = app.globalData.openid;
		var code = app.globalData.code
		// console.log(e.detail.x,e.detail.y)
		if (app.globalData.openid == '') {
            wx.showModal({
                title: '是否打开设置页面重新授权',
                content: '需要获取您的公开信息(昵称，头像等)，请到小程序的设置中打开用户信息授权',
                confirmText:'去设置',
                success:(res)=>{
                    if(res.confirm){
                        wx.openSetting({
                            success: function (res) {
                                if (res.authSetting["scope.userInfo"]) {
                                    getId(that, function (newId) {
                                        makeLike(id, newId, code, that, e)
                                    })
                                } else{
                                    wx.showToast({
                                        title: '授权失败',
                                        image: '/images/fail.png'
                                    })
                                }
                            },
                            fail: function () {
                                wx.showToast({
                                    title: '调去授权失败',
                                    image: '/images/fail.png'
                                })
                            }
                        })
                    }
                }
            })
		} else {
			makeLike(id, openid, code, that,e)
		}
	}, 
	//  ==================================================================    已经点赞过
	showTips: function (e) {
		// console.log(e)
		var that = this
		var winWidth
		wx.getSystemInfo({
			success: (res) => {
				// console.log(res)
				winWidth = res.windowWidth
				if (e.detail.x >= winWidth / 2) { //右侧
                    if(that.data.status == 3){
                        that.setData({
                            r_left: e.detail.x - winWidth +20 + 'rpx',
                            r_top: e.detail.y - 40 + 'px',
                            rightTips: true
                        })
                    }else{
                        that.setData({
                            r_left: e.detail.x - winWidth + 'rpx',
                            r_top: e.detail.y - 50 + 'px',
                            rightTips: true
                        })
                    }
					
				} else {
					// console.log(e.detail.x,':',e.detail.y)
                    if(that.data.status == 3){
                        that.setData({
                            l_left: e.detail.x + 90 + 'rpx',
                            l_top: e.detail.y - 40 + 'px',
                            leftTips: true
                        })
                    }else{
                        that.setData({
                            l_left: e.detail.x + 50 + 'rpx',
                            l_top: e.detail.y - 40 + 'px',
                            leftTips: true
                        })
                    }
					
				}
			}
		})
		setTimeout(function () {
			that.setData({
				rightTips: false,
				leftTips: false
			})
		}, 1000)
	},
	// ===================================================================     更改排序方式
	hotOrder: function () {
		var that = this;
		that.setData({
			hotOrder: !that.data.hotOrder,
			spread: false,
			page: 1
		})
		var head = app.globalData.head;
		var nickname = app.globalData.nickname;
		var openid = app.globalData.openid || ''
		var code = app.globalData.code
		var sort = !that.data.hotOrder ? 'likes' : 'create_time'
        getList(sort, 1, 10, code, openid, that, function () {
            wx.showToast({
                title: '切换成功',
            })
        })
	},
	//=====================================================================    跳转到我的梦想
	toMyDream: function () {
		var that = this
		var id = app.globalData.openid
		if (id == '') {
			wx.openSetting({
				success: (res) => {
					if (res.authSetting['scope.userInfo']) {
						getId(that, function (newId) {
                            getMyDream(that, app, function(){
                                if (that.data.status == 1) {
                                    wx.navigateTo({
                                        url: '../mxq1/myDream/myDream?id=' + newId,
                                    })
                                } else if (that.data.status == 2) {
                                    wx.navigateTo({
                                        url: '../mxq2/myDream/myDream?id=' + newId,
                                    })
                                } else if (that.data.status == 3) {
                                    wx.navigateTo({
                                        url: '../mxq3/myDream/myDream?id=' + newId,
                                    })
                                } else {
                                    wx.navigateTo({
                                        url: '../mxq4/myDream/myDream?id=' + newId,
                                    })
                                }
                            }) 
						})

					}
				}
			})
		}else {
            getMyDream(that, app,function(){
                // console.log(2)
                if (that.data.status == 1) {
                    wx.navigateTo({
                        url: '../mxq1/myDream/myDream?id=' + id,
                    })
                } else if (that.data.status == 2) {
                    wx.navigateTo({
                        url: '../mxq2/myDream/myDream?id=' + id,
                    })
                } else if (that.data.status == 3) {
                    wx.navigateTo({
                        url: '../mxq3/myDream/myDream?id=' + id,
                    })
                } else {
                    wx.navigateTo({
                        url: '../mxq4/myDream/myDream?id=' + id,
                    })
                }
            })
		}
		that.setData({
			spread: false
		})
	},
	// 跳转到公司
	toComp: function () {
		var that = this;
        if (that.data.status == 1) {
            wx.navigateTo({
                url: '../mxq1/comp/comp',
            })
        } else if (that.data.status == 2) {
            wx.navigateTo({
                url: '../mxq2/comp/comp',
            })
        } else if (that.data.status == 3) {
            wx.navigateTo({
                url: '../mxq3/comp/comp',
            })
        } else {
            wx.navigateTo({
                url: '../mxq4/comp/comp',
            })
        }
        that.setData({
            spread: false
        })
	},
	// 详情
	toDetail: function (e) {
		var that = this
        if(e.target.dataset.color){
            app.globalData.bgc = e.target.dataset.color
        }
        var id = e.target.dataset.id?e.target.dataset.id:e.currentTarget.dataset.id
		if (this.data.status == 1) {
			wx.navigateTo({
				url: '../mxq1/mxdetail/mxdetail?id=' +id,
			})
		} else if (this.data.status == 2) {
			wx.navigateTo({
				url: '../mxq2/mxdetail/mxdetail?id=' +id,
			})
		} else if (this.data.status == 3) {
			wx.navigateTo({
				url: '../mxq3/mxdetail/mxdetail?id=' + id,
			})
		} else {
			wx.navigateTo({
				url: '../mxq4/mxdetail/mxdetail?id=' + id,
			})
		}
		that.setData({
			spread: false
		})
	},
	// BGM播放停止
	playBgm: function () {
		var that = this
        if (that.data.musicSrc == '' || app.globalData.hideMusic){
            that.setData({
                playing:false
            })
        }else{
            this.setData({
                playing: !this.data.playing
            })
        }
		if (!app.globalData.playing ) {
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
	//  ==================================================================   删除
	del: function (e) {
		var that = this;
		var openid = app.globalData.openid;
		var code = app.globalData.code;
		var dreamid = parseInt(e.target.dataset.id);
        var color = that.data.status == 1 ? '#4d4a9a' : '#fbbf49';
		wx.showModal({
			title: '删除提示',
			content: '确认删除此' + app.globalData.dream_name + '？',
            confirmColor:color,
			success: function (res) {
				if (res.confirm) {
					// console.log(dreamid +",type:" + typeof (dreamid))
					del(openid, dreamid, code, that)
				} else if (res.cancel) {
					return;
				}
			},
			fail: (res) => {
				wx.showToast({
					title: '操作失败',
					image: '/images/fail.png'
				})
			}
		})
	},
	//  ==================================================================   到达页面底部，加载下一页
	onReachBottom: function () {
		var that = this
		var openid = app.globalData.openid;
		var code = app.globalData.code;
        if (that.data.leftList.length % 5 == 0) {
            // console.log('loading')
            that.setData({
                page: that.data.page + 1,

            })
            loadMore(that, code, openid)
        } else {
            that.setData({
                loading: '没有更多'
            })
            setTimeout(function () {
                that.setData({
                    loading: '',
                    bottom:0
                })
            }, 1000)
            // console.log('no more')
        }
	},
	onPageScroll: function (e) {
		var that = this
		if (e.scrollTop > 1) {
			that.setData({
				showTotop: true
			})
		} else {
			that.setData({
				showTotop: false
			})
		}
	},
	onPullDownRefresh: function () {
		var that = this;
		var head = app.globalData.head;
		var nickname = app.globalData.nickname;
		var openid = app.globalData.openid
		var code = app.globalData.code
		var sort = !that.data.hotOrder ? 'likes' : 'create_time'
		// console.log(sort)
        that.setData({
            page: 1
        })   // 
        getList(sort, 1, 10, code, openid, that)
	},
	onShareAppMessage: function (res) {
		var that = this
		return {
			title: app.globalData.title,
			path: '/pages/index/index?share=true',
			success: function (res) {
        app.globalData.playing=false;
        that.setData({
          playing: false,
        })
				wx.showToast({
					title: '转发成功',
				});
        
			},
			fail: function (res) {
				wx.showToast({
					title: '转发失败',
					image: '/images/fail.png'
				})
			}
		}
	},
	prevImg:function(e){
    var that=this;
		// console.log(e.target.dataset.src);
		// wx.previewImage({
		// 	urls: [e.target.dataset.src],
    //   success:function(){
    //     wx.getBackgroundAudioPlayerState({
    //       success: function (res) {
            
    //         console.log(res.status)
    //       }
    //     })
       
    //   }
		// })
    that.setData({
      bigimg:true,
     bigimgsrc: e.target.dataset.src
    })
    
	},
  bigimgclose:function(){
    this.setData({
      bigimg: false,
    })
  },
    // sendBgc
    sendBgc:function(e){
        console.log(e.target.dataset)
    }
})

//11111111111111111111111111111111111111111111111111111111111111111111111111 获取OPENID
function getId(that, callback,failcallback) {
	var myCode;
	var sign;
	var head;
	var nickname;
	var code;
	wx.showLoading({
		title: '请求数据中',
	})
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
                                // console.log(res.uerInfo)
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
                                            wx.hideLoading()
											app.globalData.openid = res.data.data.openid
											app.globalData.user_id = res.data.data.user_id
											that.setData({
												user_id: res.data.data.user_id,
                                                openid : res.data.data.openid
											})
                                            // console.log(that.data.user_id,res.data.data.user_id)
											if (callback) {
												callback(res.data.data.openid)
											}
										}else if(res.data.ret == 100){
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
                                        }else {
											app.globalData.openid = ''
											wx.hideLoading()
											wx.showToast({
												title: res.data.msg,
												image: '/images/fail.png',
                                                duration:2000
											})
                                            if (callback) {
                                                callback(app.globalData.openid)
                                            }
										}
									},
									fail: (res) => {
										// callback('-1')
										wx.hideLoading()
										wx.showToast({
											title:res.errMsg,
											image: '/images/fail.png'
										})
										app.globalData.openid = ''
									}
								})
							},
                            fail: (res) => {
                                wx.hideLoading()
								app.globalData.head = ''
								app.globalData.nickname = ''
								app.globalData.openid = ''
								wx.showToast({
									title: res.errMsg,
									image: '/images/fail.png'
								})
							}
						})

					},
                    fail: (res) => {
                        console.log( res)
						wx.hideLoading()
						wx.showToast({
							title: res.errMsg,
							image:'/images/fail.png'
						})
						app.globalData.openid = ''
                        that.setData({
                            openid:'',
                            user_id:''
                        })
					}
				})

			} else {
				console.log('获取CODE失败:' + res)
				app.globalData.openid = ''
				wx.showToast({
                    title: res.data.msg,
					image:'/images/fail.png'
				})
			}
		},
        fail: (res) => {
            console.log(res)
			wx.hideLoading()
			wx.showToast({
                title: res.errMsg,
                image:'/images/fail.png'
			})
			// wx.setStorageSync('code', '-1')
			app.globalData.openid = ''
			console.log('获取CODE失败:' + res)
		}
	})
	// }
}

//  222222222222222222222222222222222222222222222222222222222222222222222222 发布梦想
function submit(openid, dream, dream_thumb, anonymous, code, that) {
    // console.log(dream_thumb)
	
		// console.log(dream,dream_thumb)
		if (dream == '' && dream_thumb == '') {
            // console.log(1)
			wx.showToast({
                title: '请填写' + app.globalData.dream_name,
			})
        } else if (dream == ''){
            wx.showToast({
                title: '请填写' + app.globalData.dream_name,
            })
        } else {
            wx.showLoading({
                title: '发布中',
            })
			if (dream_thumb == '') {     // 没有添加图片
				wx.request({
					url: url + '/dream/index/add.json?customer_id=' + customer_id,
					method: 'POST',
					data: {
						customer_id: customer_id,
						openid: openid,
						dream: dream,
						dream_thumb: dream_thumb,
						anonymous: anonymous,
						sign: md5.md5('anonymous=' + anonymous + '&customer_id=' + customer_id + '&dream_thumb=' + dream_thumb + '&openid=' + openid + code)
					},
					success: (res) => {
						// console.log('sub:', res)
						if (res.data.ret == 200) {
							wx.showToast({
								title: '发布成功',
							})
							getList('create_time', 1, 10, code, openid, that)
							that.setData({
								page: 1,
								dream: '',
								imgSrc: ''
							})
						} else {
							// console.log('in')
                            wx.showModal({
                                title: '发布提示',
                                image:'/images/fail.png',
                                showCancel:false,
                                content: res.data.msg,
                            })
							that.setData({
								page: 1,
								dream: '',
								imgSrc: ''
							})
						}
					},
					fail: (res) => {
						wx.showToast({
							title: res,
							image:'/images/fail.png'
						})
						console.log(res)
					},
					complete: function () {
						wx.hideLoading()
						that.setData({
							add: false
						})
					}
				})
			} else {                            //有添加图片
				wx.uploadFile({
					url: url + '/dream/file/upload.json?customer_id=' + customer_id,
					filePath: dream_thumb,
					name: 'file',
					formData: {
						customer_id: customer_id,
						openid: openid,
						sign: md5.md5('customer_id=' + customer_id + '&openid=' + openid + code)
					},
					success: function (res) {
						// console.log('upImg',res)
						if (res.statusCode == 200) {
							dream_thumb = res.data
							wx.request({
								url: url + '/dream/index/add.json?customer_id=' + customer_id,
								method: 'POST',
								data: {
									customer_id: customer_id,
									openid: openid,
									dream: dream,
									dream_thumb: dream_thumb,
									anonymous: anonymous,
									sign: md5.md5('anonymous=' + anonymous + '&customer_id=' + customer_id + '&dream_thumb=' + dream_thumb + '&openid=' + openid + code)
								},
								success: (res) => {
									// console.log(res)
                                    if (res.data.ret == 200) {
                                        wx.hideLoading()
										wx.showToast({
											title: '发布成功',
										})
										getList('create_time', 1, 10, code, openid, that)
										that.setData({
											page: 1,
											dream:'',
											imgSrc:''
										})
                                    } else {
                                        wx.hideLoading()
										that.setData({
											page: 1,
											dream: '',
											imgSrc: ''
										})
                                        wx.showModal({
                                            title: '发布提示',
                                            content: res.data.msg,
                                        })
									}
								},
                                fail: (res) => {
                                    wx.hideLoading()
									wx.showToast({
										title: res,
										image:'/images/fail.png'
									})
									console.log(res)
								},
                                complete: function () {
                                    wx.hideLoading()
									that.setData({
										add: false
									})
								}
							})
                        } else {
                            wx.hideLoading()
							console.log(res)
							wx.showToast({
								title: '图片上传失败，', res,
								image:'/images/fail.png'
							})
						}
					},
                    fail: (res) => {
                        wx.hideLoading()
						wx.showToast({
							title: '请求失败', res,
							image: '/images/fail.png'
						})
						console.log(res)
					}
				})
			}

		}
}
// 3333333333333333333333333333333333333333333333333333333333333333333333333 获取梦想列表
function getList(sort, page, pagesize, code, openid, that,callback) {
        wx.request({
            url: url + '/dream/index/lists.json?customer_id=' + customer_id,
            method: 'POST',
            data: {
                customer_id: customer_id,
                page: page,
                pagesize: pagesize,
                sort: sort,
                openid: openid,
                sign: md5.md5('customer_id=' + customer_id + "&openid=" + openid + "&page=" + page + '&pagesize=' + pagesize + '&sort=' + sort + code)
            },
            success: (res) => {
                // console.log(res)
                if (res.data.ret == 200) { //请求成功
                    var data = res.data.data;
                    // console.log(data)
                    if (data.length > 0) {
                        leftList = [];
                        rightList = [];
                        for (var i = 0; i < data.length; i++) {
                            data[i].dream = toGB(data[i].dream)
                            var row = data[i]
                            if (i < 4) {
                                data[i].index = i + 1;
                            } else if (i % 4 == 0 || i == 4) {
                                data[i].index = 1
                            } else if (i % 4 == 1) {
                                data[i].index = 2
                            } else if (i % 4 == 2) {
                                data[i].index = 3
                            } else if (i % 4 == 3) {
                                data[i].index = 4
                            }
                            if (i % 2 == 0) {   //单数
                                leftList.push(data[i])
                            } else {
                                rightList.push(data[i])
                            }
                        }
                        that.setData({
                            leftList: leftList,
                            rightList: rightList
                        })
                        console.log(that.data.leftList)
                        wx.pageScrollTo({
                            scrollTop: 0
                        })
                        if (callback) {
                            callback()
                        }
                    } else {

                    }
                }
                else {
                    that.setData({
                        leftList: leftList,
                        rightList: rightList
                    })
                    wx.showToast({
                        title: res.data.msg,
                        image: '/images/fail.png'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '请求错误',
                    image: '/images/fail.png'
                })
                console.log(res)
            },
            complete: function () {
                // wx.hideLoading()
                wx.stopPullDownRefresh();
            }
        })
}

//  ========================================================================= 点赞
function makeLike(id, openid, code, that,e) {
	if (openid == '') {
		wx.showToast({
			title: '您未登陆',
		})
	} else {
		// console.log(that.data.rightList,':',that.data.leftList)
		var leftL = that.data.leftList
		var rightL = that.data.rightList
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
				// console.log('like', res)
				if (res.data.ret == 200) {
					for (var i = 0; i < rightL.length; i++) {
						if (rightL[i].id == id) {
							var time = new Date().getTime()
							// console.log(time)
							rightL[i].likes_time = time,
                            rightL[i].likes += 1
							that.setData({
								rightList: rightL
							})
						} 
					}
                    for (var j = 0; j < leftL.length; j++) {
                        if (leftL[j].id == id) {
                            var time = new Date().getTime()
                            leftL[j].likes_time = time
                            leftL[j].likes = leftL[j].likes + 1
                            that.setData({
                                leftList: leftL
                            })
                        }
                    }
					that.setData({
						likedId: id
					})
                    wx.showToast({
                        title: '点赞成功',
                    })
				} else if (res.data.msg == '抱歉，禁止重复点赞') {
					var code = app.globalData.code
					var openid = app.globalData.openid
					getList('create_time', 1, 10, code, openid, that)
					
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
					image: '/images/fail.png'
				})
			}
		})
	}
}

//  ========================================================================= delete
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
				that.setData({
					page:1
				})
				getList('create_time', 1, 10, code, openid, that);
				wx.pageScrollTo({
					scrollTop: 0
				})
			} else {
				wx.showToast({
					title: "操作失败:" + res.data.msg,
					image: '/images/fail.png'
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

//  ========================================================================= 获取更多
function loadMore(that, code, openid) {
	var left = that.data.leftList
	var right = that.data.rightList
	var page = that.data.page
    var sort = !that.data.hotOrder ? 'likes' : 'create_time'
	that.setData({
		loading: 'loading',
        bottom:'174rpx'
	})
	// console.log(page)
	wx.request({
		url: url + '/dream/index/lists.json?customer_id=' + customer_id,
		method: 'POST',
		data: {
			customer_id: customer_id,
			openid: openid,
			page: page,
			pagesize: 10,
            sort: sort,
            sign: md5.md5('customer_id=' + customer_id + '&openid=' + openid + '&page=' + page + '&pagesize=' + 10 + '&sort=' + sort + code)
		},
		success: (res) => {
			//    console.log('more:',res)
			if (res.data.ret == 200) {
				var data = res.data.data;
				//    console.log(data)
				if(data.length == 10){
					for (var i = 0; i < data.length; i++) {
                        data[i].dream = toGB(data[i].dream) 
						if (i < 4) {
							data[i].index = i + 1;
						} else if (i % 4 == 0 || i == 4) {
							data[i].index = 1
						} else if (i % 4 == 1) {
							data[i].index = 2
						} else if (i % 4 == 2) {
							data[i].index = 3
						} else if (i % 4 == 3) {
							data[i].index = 4
						}
						if (i % 2 == 0) {   //单数
							left.push(data[i])
						} else {
							right.push(data[i])
						}
					}
					that.setData({
						leftList: left,
						rightList: right,
						loading: ''
					})
				}else if(data.length == 0){
					that.setData({
						loading: '没有更多',
                        bottom:0
					})
					setTimeout(function () {
						that.setData({
							loading: ''
						})
					}, 1500)
				}else{
					for (var i = 0; i < data.length; i++) {
						if (i < 4) {
							data[i].index = i + 1;
						} else if (i % 4 == 0 || i == 4) {
							data[i].index = 1
						} else if (i % 4 == 1) {
							data[i].index = 2
						} else if (i % 4 == 2) {
							data[i].index = 3
						} else if (i % 4 == 3) {
							data[i].index = 4
						}
						if (i % 2 == 0) {   //单数
							left.push(data[i])
						} else {
							right.push(data[i])
						}
					}
					that.setData({
						leftList: left,
						rightList: right,
						loading: ''
					})
				}
				
			} else {
				that.setData({
					loading:''
				})
				wx.showToast({
					title: '获取更多失败',
					image: '/images/fail.png'
				})
			}

		},
		fail: (res) => {
			wx.showToast({
				title: '获取更多失败',
				image: '/images/fail.png'
			})
			console.log(res)
			that.setData({
				loading: ''
			})
		}
	})
}

//  模版判断
function getStatus(that, app, callback) {
	wx.request({
		url: url + '/sign.json?customer_id=' + customer_id,
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
                            app.globalData.hideMusic = data.is_music == 0 ? true : false
							app.globalData.is_anonymous = data.is_anonymous == 1? true : false
                            app.globalData.dream_name = data.dream_name
                            app.globalData.backgroundUrl = data.backgrund_url
							that.setData({
                                dream_name: data.dream_name,
                                musicSrc: data.is_music_url,
                                hasStatus:true,
                                status: data.themes, // data.themes
								wish_name: data.wish_name,
                                is_anonymous: data.is_anonymous == 1 ? true : false,
                                tx: data.is_special,//data.is_special
                                backgroundUrl: data.backgrund_url,
                                hideMusic: data.is_music == 0 ? true : false
							})
							if (callback) {
								callback(app)
							}
						}else{
                            wx.showToast({
                                title: res.data.msg,
                                image:'/images/fail.png'
                            })
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

// =========================================================================== getMyDreamList
function getMyDream(that, app, callback) {
    wx.request({
        url: url + '/dream/index/my.json?customer_id=' + customer_id,
        method: 'POST',
        data: {
            customer_id: customer_id,
            openid: app.globalData.openid,
            sign: md5.md5('customer_id=' + customer_id + '&openid=' + app.globalData.openid + app.globalData.code)
        },
        success: (res) => {
            if (res.data.ret == 200) {
                if(res.data.data.length == 0){
                    wx.showModal({
                        title: '提示',
                        content: '您还没有' + that.data.wish_name + '，快去' + that.data.wish_name,
                        showCancel:false
                    })
                }else{
                    callback()
                }
            } else {
               wx.showToast({
                   title: res.data.msg,
                   image:'/images/fail.png'
               })
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

function toUnicode(str){
    return str
}
function toGB(str) {
    return unescape(str.replace(/\\u/gi, '%u'));
}