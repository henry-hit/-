// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

const db=cloud.database().collection("reply")
// 云函数入口函数
exports.main = async (event, context) => {
  const postId = event.postId
  const replyList = await db.aggregate().match({
    post_id: postId,
    reply_type: 0
  }).lookup({
    from: 'user',
    localField: '_openid',
    foreignField: '_openid',
    as: 'user',
  }).sort({
    time:1
  }).end()
  let realList =[]
  console.log(replyList)
  replyList.list.forEach(element => {
    var oneElement = {}
    if(element.anonymous){
      oneElement={
        name:"匿名用户",
        avatarUrl:"https://6869-hitsz-raubs-1302289355.tcb.qcloud.la/pageDetail/%E5%8C%BF%E5%90%8D%E5%A4%B4%E5%83%8F.png?sign=ec343059d7fc7494a9b073c9f202b43a&t=1592925765"
      } 
    }else{
      oneElement={
        name: element.user[0].name,
        avatarUrl: 'https://6869-hitsz-raubs-1302289355.tcb.qcloud.la/touxiang/'+element.user[0]._id+'.png'
      } 
    }
    oneElement._id= element._id
    oneElement.mark= element.mark
    oneElement.date= element.date
    oneElement.content= element.content
    realList.push(oneElement)
  });
  console.log(realList)
  return {
    realList
  }
}