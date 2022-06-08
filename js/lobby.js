let appID ='f2221fb73ad44697867acc8b5cbf1ce8'
let token = null
let uid = String(Math.floor(Math.random() * 1232))

let roomsData={}
let initiate=async () =>{
    let rtmClient=await AgoraRTM.createInstance(appID)
    await rtmClient.login({uid, token})

    let lobbyChannel=await rtmClient.createChannel('lobby')
    await lobbyChannel.join()
    rtmClient.on('MessageFromPeer' ,async (message, peerId) =>{
        let messageData = JSON.parse(message.text)
        let count=await rtmClient.getChannelMember([messageData.room])
        roomsData[messageData.room]={'members':count}
        let rooms=document.getElementById('room__container')
        let room=document.getElementById(`room__${messageData.room}`)

    })
}
initiate()