// miniprogram/pages/post/post.js
var util= require("../../utile/changeDate.js");
const dbServer = wx.cloud.database()
const DB = wx.cloud.database().collection("post") //云数据库里的post table（表）
const DB_star = wx.cloud.database().collection("star")
let title = ""
let content = ""
let resToStar = ""
Page({
  data: {
    community_id: '',
    section: '0',
    option1: [
      { text: '课堂内容区', value: 0 },
      { text: '实验区', value: 1 },
      { text: '作业区', value: 2 },
      { text: '其他区', value: 3 },
    ],
    value1: 0,
  },
  onLoad(query){
    this.setData({
      community_id: query.communityId
    })
  },

  post_title_input(event){ // 获取帖子标题
    title = event.detail
    console.log(title)
  },
  post_content_input(event){ // 获取帖子内容
    content = event.detail
    console.log(content)
  },
  afterChoose1(event){
    const value=event.detail
    console.log(value)
    this.setData({
      value1:value
    })
  },

  // 将帖子标题和内容上传到数据库
  post_one(){ //点击发布
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const date = util.js_date_time(timestamp)
    // const time= new Date()
    DB.add({ // 将输入添加到DB.post中
      data:{
        title: title,
        content:content,
        section: this.data.value1,
        community_id: this.data.community_id,
        time:date,
        lastModifiedTime:date,
        top:false,
        solved: false
      },
      success(res){
        console.log("添加成功",res)
        resToStar = res._id 
        DB_star.add({
          data:{
            post_id: resToStar,
          }
        }) 
        wx.showToast({
          title: '发布成功！', // 标题
          icon: 'success',  // 图标类型，默认success
          duration: 1500  // 提示窗停留时间，默认1500ms
        })
        setTimeout(function () {
          wx.navigateBack({
            delta:1
          })
         }, 1000)
      },
      fail(res){
        console.log("添加失败",res)
      }
    }
    )
  }
})