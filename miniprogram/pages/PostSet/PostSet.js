// miniprogram/pages/StuChargeDetail/StuChargeDetail.js
const DB = wx.cloud.database().collection("post")


Page({
  data: {
    community_id: '',
    active: 2,
    list: [],
    post: [],
    post_course_top: [],
    post_course: [],
    post_experiment_top: [],
    post_experiment: [],
    post_homework_top: [],
    post_homework: [],
    post_other_top: [],
    post_other: [],
    beenView: [],
    topDic:["post_course_top", "post_experiment_top","post_homework_top","post_other_top"],
    unTopDic:["post_course", "post_experiment","post_homework","post_other"],
    pageIndex:[0,0,0,0]
  },

  onLoad(options){
    console.log('abc', options.communityId)
    const areaNum=parseInt(options.area)
    this.setData({
      community_id: options.communityId,
      active: areaNum,
      beenView: [areaNum]
    })
    this.getTop(areaNum, options.communityId)
    setTimeout(this.getPostsLeft,150,areaNum, this.data.pageIndex[areaNum], options.communityId)
  },
  
  getTop(areaNum, community_id){
    const that=this
    wx.cloud.callFunction({
      name:"getTopPost",
      data:{
          areaNum,
          "top":true,
          community_id
      },
      success: function(res){
        const key=that.data.topDic[areaNum]
        that.setData({
          [key]:res.result.realList
        })
        console.log(res)
      }
    })
  },
  getPostsLeft(areaNum, pageIndex,community_id){
    const that=this
    wx.cloud.callFunction({
      name:"getPostsLeft",
      data:{
        areaNum,
        community_id,
        pageIndex
      },
      success:function(res){
        const result=res.result.realList
        if(result==0){
          console.log("noMore")
          wx.showToast({
            title: '无更多数据',
            icon:"none",
            duration:1500
          })
        }else{
          const key=that.data.unTopDic[areaNum]
          let pageIndex=[...that.data.pageIndex]
          pageIndex[areaNum]=pageIndex[areaNum]+1
          let List=[...that.data[key]]
          List=List.concat(result)
          that.setData({
            [key]:List,
            pageIndex
          })
        }
      }
    })
  },
  // onShow(){
  //   console.log(this.data)
  //   const that = this
  //   var tmp_post_course = []
  //   var tmp_post_course_top = []

  //   var tmp_post_experiment = []
  //   var tmp_post_experiment_top = []

  //   var tmp_post_homework = []
  //   var tmp_post_homework_top = []

  //   var tmp_post_other = []
  //   var tmp_post_other_top = []
  //   DB.where({
  //     community_id: this.data.community_id
  //   }).get().then(res => {
  //     res.data.forEach(element => {
  //       if (element.section == 0) {
  //         if (element.top == true) {
  //           tmp_post_course_top.push(element)
  //         } else {
  //           tmp_post_course.push(element)
  //         }
  //       } else if (element.section == 1) {
  //         if (element.top == true) {
  //           tmp_post_experiment.push(element)
  //         } else {
  //           tmp_post_experiment_top.push(element)
  //         }
  //       } else if (element.section == 2) {
  //         if (element.top == true) {
  //           tmp_post_homework.push(element)
  //         } else {
  //           tmp_post_homework_top.push(element)
  //         }   
  //       } else if (element.section == 3) {
  //         if (element.top == true) {
  //           tmp_post_other.push(element)
  //         } else {
  //           tmp_post_other_top.push(element)
  //         }
  //       }
  //     })
  //     that.setData({
  //       post_course: tmp_post_course,
  //       post_course_top: tmp_post_course_top,

  //       post_experiment: tmp_post_experiment,
  //       post_experiment_top: tmp_post_experiment_top,

  //       post_homework: tmp_post_homework,
  //       post_homework_top: tmp_post_homework_top,

  //       post_other: tmp_post_other,
  //       post_other_top: tmp_post_other_top
  //     })
  //   })
  // },
  onChange(options) {
    const areaNum=options.detail.index
    this.setData({
      active: areaNum
    })
    if(this.data.beenView.indexOf(areaNum) == -1){
      this.getTop(areaNum, this.data.community_id)
      setTimeout(this.getPostsLeft,150,areaNum, this.data.pageIndex[areaNum], this.data.communityId)
      
    }
  },
  onReachBottom(){//上拉刷新
    console.log(this.data)
    console.log("continue")
    const areaNum=this.data.active
    this.getPostsLeft(areaNum, this.data.pageIndex[areaNum],this.data.communityId)
  },
  onPullDownRefresh(){ //下拉刷新
    const areaNum=this.data.active
    let pageIndex=[...this.data.pageIndex]
    pageIndex[areaNum]=0
    const topKey=this.data.topDic[areaNum]
    const unTopKey=this.data.unTopDic[areaNum]
    this.setData({
      pageIndex,
      [topKey]:[],
      [unTopKey]:[]
    },()=>{
      this.getTop(areaNum, this.data.community_id)
      setTimeout(this.getPostsLeft,200,areaNum, this.data.pageIndex[areaNum],this.data.communityId)
    })
  }
})
