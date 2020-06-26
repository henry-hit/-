// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db=cloud.database().collection("post")
// 云函数入口函数
exports.main = async (event, context) => {
  const section=event.areaNum
  const top=event.top
  const community_id=event.community_id 
  let realList=[]
  const topPosts = await db.where({
    section,
    top,
    community_id
  }).orderBy("lastModifiedTime","desc").orderBy("solved","asc").get()
  topPosts.data.forEach(element => {
    realList.push({
      _id: element._id,
      title: element.title,
      section: element.section,
      top: element.top,
      lastModifiedTime: element.lastModifiedTime,
      solved: element.solved
    })
  });
  return{
    realList
  }
}