function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function trim(str) { return str.replace(/(^\s*)|(\s*$)/g, ""); }
var url = 'https://admin.mumo028.com/mini_program/dreamwall/api.php';
var md5 = require("md.js");
function getStatus(that, app, customer_id, callback) {
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
                            app.globalData.hideMusic = data.is_music == 0 ? true : false
                            that.setData({
                                dream_name: data.dream_name,
                                musicSrc: data.is_music_url,
                                hasStatus: true,
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
module.exports = {
  formatTime: formatTime,
  url:'https://admin.mumo028.com/mini_program/dreamwall/api.php',
  trim: trim,
  getStatus: getStatus,
  http_host:'https://admin.mumo028.com'
}
