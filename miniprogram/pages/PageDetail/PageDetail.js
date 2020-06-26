
var util= require("../../utile/changeDate.js");
const DB_reply = wx.cloud.database().collection("reply")
const DB_post = wx.cloud.database().collection("post")
const DB_star = wx.cloud.database().collection("star")
const DB_join = wx.cloud.database().collection("join_community")
const db = wx.cloud.database()

Page({
  data: {
    show: false,
    option2: [
      { text: '匿名', value: true },
      { text: '非匿名', value: false },
    ],
    guanzhu: false,  //关注记得动态获取初始化
    top:false, //置顶记得动态初始化
    value2: false,
    content: '',
    post: '',
    postId:'',
    reply_to_post: [],
    solved: false,
    community_id: '',
    status: 'student'
  },

  // findTarget: function(reply) {
  //   return reply._id === 
  // },

  onLoad(query) {
    this.setData({
      postId: query.post,
    });
    const postId = query.post
    var local_community_id = ''
    const that = this
    DB_post.where({
      _id: postId
    }).get().then(res =>{
      local_community_id = res.data[0].community_id
      that.setData({
        post: res.data[0],
        top: res.data[0].top,
        solved:res.data[0].solved,
        community_id: res.data[0].community_id
      }, () => {
        wx.getStorage({
          key: 'openid',
          success (res) {
            const openid = res.data
            DB_star.where({
              "_openid": openid,
              "post_id": postId
            }).get({
              success: function(res) {
                if (res.data.length >= 1) {
                  that.setData({
                    guanzhu: true
                  })
                }
              }
            })
            DB_join.where({
              "_openid": openid,
              "communityId": local_community_id
            }).get().then(res => {
              console.log("here", res)
              that.setData({
                status: res.data[0].status
              })
            })
          }
        })
      })
    })
  },

    // var tmp_reply_to_reply = []
    // var tmp_reply_to_post = []

    // DB_reply.where({
    //   post_id: this.data.postId
    // }).get().then(res => {
    //   res.data.forEach(element => {
    //     if (element.reply_type == 0){
    //       element.reply = []
    //       tmp_reply_to_post.push(element)
    //     } else if (element.reply_type == 1){
    //       tmp_reply_to_reply.push(element)
    //     }
    //   })
    //   // that.setData({
    //   //   reply_to_post: tmp_reply_to_post,
    //   //   reply_to_reply: tmp_reply_to_reply
    //   // })
    //   console.log(tmp_reply_to_reply)
    //   console.log(tmp_reply_to_post)

    //   var flag = 0
    //   var element
    //   var target
    //   for (var i=0; i < tmp_reply_to_reply.length; i++) {
    //     flag = 0
    //     element = tmp_reply_to_reply[i]
    //     for (var j=0; j < tmp_reply_to_post.length; j++) {
    //       target = tmp_reply_to_post[j]
    //       if (target._id == element.reply_to) {
    //         target.reply.push(element)
    //         break
    //       }
    //       for (var k=0; k < target.reply.length; k++) {
    //         if (target.reply[k]._id == element.reply_to) {
    //           target.reply.push(element)
    //           flag = 1
    //           break
    //         }
    //       }
    //       if (flag == 1)
    //         break
    //     }
    //   }
    //   that.setData({
    //     reply_to_post: tmp_reply_to_post
    //   })
    //   console.log(tmp_reply_to_post)
    // })
  
  onShow(){
    const _this=this
    wx.cloud.callFunction({
      name: "getReplyList",
      data:{
        postId: this.data.postId
      },
      success: function(res){
        console.log(res.result.realList)
        _this.setData({
          reply_to_post:res.result.realList
        })
      }
    })
  },

  onChange(event) {
    console.log(event.detail)
    // event.detail 为当前输入的值
    this.setData({
      content:event.detail
    })
  },
  changeNiming(e){
    this.setData({
      value2:e.detail
    })
  },
  onClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      radio: name,
    });
  },
  showPopup() {
    console.log("bbb")
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  reply_one(){
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);  
    console.log('click')
    const that=this
    const date = util.js_date_time(timestamp)
    // const date=new Date(n)
    console.log(date)
    const content = this.data.content
    if (content == '') {
      wx: wx.showToast({
        title: '回复内容不要为空噢',
        icon: 'none'
      })
      return false
    }
    const _data = {
      anonymous: this.data.value2,
      content,
      mark: false,
      post_id: this.data.post_id,
      date:date,
      time:date,
      post_id: this.data.postId,
      reply_to: this.data.postId,
      reply_type: 0,

      // reply_to: this.data.reply_to,
      // reply_type: this.data.reply_type
    }
    console.log(date)
    DB_reply.add({
      data: _data,
      success: function(res){
        wx.showToast({
          title: '回复成功', // 标题
          icon: 'success',  // 图标类型，默认success
          duration: 1500  // 提示窗停留时间，默认1500ms
        })

        that.onShow()
        that.setData({
          content:''
        })
      }
    })
  },

  deletePost(){
    if (this.data.status == 'student') {
      wx.showToast({
        title: '您不是管理员哦！',
        duration: 1000,
        icon: "none"
      })
    } else {
      const post_id = this.data.post._id
      wx.showModal({
        title: '提示',
        content: '确认删除该帖子？',
        success (res) {
          if(res.confirm){
            let postData = { post_id }
            wx.cloud.callFunction({
              name: 'deletePostData',
              data: postData,
              complete: res => {
                console.log("complete")
                wx.showToast({
                  title: '删除成功',
                  duration: 1000,
                  icon: "success"
                })
                setTimeout(function(){
                  wx.navigateBack({
                    delta: 1
                  })
                },1000)
              }
            })
          }
        }
      })
    }
    
  },
  guanzhu(){
    var granzhu = !this.data.guanzhu
    if (granzhu){
      DB_star.add({
        data: {
          post_id: this.data.postId,
          time: parseInt(new Date().getTime())
        },
        success: res=> {
          this.setData({
            guanzhu: granzhu
          })
          wx.showToast({
            title: '已关注本帖', // 标题
            icon: 'success',  // 图标类型，默认success
            duration: 2500  // 提示窗停留时间，默认1500ms
          })
        }
      })
    } else {
      let starData = { post_id: this.data.postId }
      wx.cloud.callFunction({
        name: 'deleteStar',
        data: starData,
        complete: res => {
          console.log("complete")
          this.setData({
            guanzhu: granzhu
          })
          wx.showToast({
            title: '已取消关注',
            duration: 1000,
            icon: "success"
          })
        }
      })
    }
  },

  zhiding(){
    if (this.data.status == 'student') {
      wx.showToast({
        title: '您不是管理员哦！',
        duration: 1000,
        icon: "none"
      })
    } else {
      var top = !this.data.top
      let topData = { 
        post_id: this.data.postId,
        top: top
      }
      this.setData({
        top: top
      })
      wx.cloud.callFunction({
        name: 'changeTop',
        data: topData,
        success: res => {
          if (top){
            wx.showToast({
              title: '已置顶本贴',
              duration: 1000,
              icon: "success"
            })
          } else {
            wx.showToast({
              title: '已取消置顶',
              duration: 1000,
              icon: "success"
            })
          }
        }
      })
    }
  },
  notResolved(){
    const that = this
    let solvedData = { 
      post_id: this.data.postId,
      solved: false
    }
    wx.cloud.callFunction({
      name: 'changeSolved',
      data: solvedData,
      success: res => {
        that.setData({
          solved: false
        })
        wx.showToast({
          title: '状态改为未解决',
          duration: 1000,
          icon: "success"
        })
      }
    })
  },
  resolved(){
    const that = this
    let solvedData = { 
      post_id: this.data.postId,
      solved: true
    }
    wx.cloud.callFunction({
      name: 'changeSolved',
      data: solvedData,
      success: res => {
        that.setData({
          solved: true
        })
        wx.showToast({
          title: '状态修改为已解决',
          duration: 1000,
          icon: "success"
        })
      }
    })
  },

  addScore(event) {
    if (this.data.status == 'student') {
      wx.showToast({
        title: '您不是管理员哦！',
        duration: 1000,
        icon: "none"
      })
    } else {
      const index = event.currentTarget.dataset['index']
      const scoreData = {
        reply_id: event.currentTarget.dataset['reply_id'],
        mark: !event.currentTarget.dataset['mark'],
        community_id: this.data.community_id
      }
      const that = this
      wx.cloud.callFunction({
        name: 'changeScore',
        data: scoreData,
        complete: res => {
          var tmp = that.data.reply_to_post
          tmp[index].mark = !event.currentTarget.dataset['mark']
          
          that.setData({
            reply_to_post: tmp
          })
          wx.showToast({
            title: '成绩已改动',
            duration: 1000,
            icon: "success"
          })
        }
      })
    }
  }
})
