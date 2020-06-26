// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})
const db_reply = cloud.database().collection("reply")
const db_join = cloud.database().collection("join_community")

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const reply_id = event.reply_id
  const mark = event.mark
  const community_id = event.community_id
  var openid = ''
  var score = 0
  var success=1

  await db_reply.where({
    _id: reply_id,
  }).get().then(res => {
    openid = res.data[0]._openid
  }).catch(err=>{
    success=0
  })

  await db_reply.where({
    _id: reply_id,
  }).update({
    data:{
      mark: mark
    }
  })

  await db_join.where({
    _openid: openid,
    communityId: community_id
  }).get().then(res => {
    score = res.data[0].score
  })
  if (mark == true) {
    await db_join.where({
      _openid: openid,
      communityId: community_id
    }).update({
      data: {
        score: score + 1
      },
    })
  } else {
    await db_join.where({
      _openid: openid,
      communityId: community_id
    }).update({
      data: {
        score: score - 1
      },
    })
  }

  return
}