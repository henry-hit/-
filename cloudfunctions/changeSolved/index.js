// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})
const db = cloud.database().collection("post")

// 云函数入口函数
exports.main = async (event, context) => {
  const post_id=event.post_id
  const solved = event.solved
  success=1
  await db.where({
    _id: post_id,
  }).update({
    data:{
      solved: solved
    }
  }).catch(err=>{
    success=0
  })
  return({
    success
  })
}