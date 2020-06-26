// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database().collection("post")
// 云函数入口函数
exports.main = async (event, context) => {
  const section=event.areaNum
  const community_id = event.community_id
  const top=false
  const page=10*event.pageIndex
  let realList=[]
  const tmpList=await db.where({
    section,
    community_id,
    top
  }).orderBy("lastModifiedTime","desc").orderBy("solved","asc"
  ).skip(page).limit(10).get()
  tmpList.data.forEach(element => {
    realList.push({
      _id: element._id,
      title: element.title,
      section: element.section,
      top: element.top,
      lastModifiedTime: element.lastModifiedTime,
      solved: element.solved
    })
  });
  return {
    realList
  }
}