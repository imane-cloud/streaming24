let messagesContainer = document.getElementById('messages')
messagesContainer.scrollTop = messagesContainer.scrollHeight
let appID ='f2221fb73ad44697867acc8b5cbf1ce8'
let token = null
let uid = String(Math.floor(Math.random() * 232))

let urlParams = new URLSearchParams(window.location.search)

let displayName = sessionStorage.getItem('display_name')
let room = urlParams.get('room')
if ( room === null || displayName === null ) {
    window.location = `join.html?room=${room}`
}


let initiate = async () => {
    let rtmClient = await AgoraRTM.createInstance(appID)
    await rtmClient.login({uid, token})

    const channel = await rtmClient.createChannel(room)
    await channel.join()

    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})

    channel.on('MemberLeft',async (memberId) => {
        removeParticipantFromDom(memberId)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    })

    channel.on('MemberJoined', async(memberId) => {
        addParticipantToDom(memberId)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)

    })
    
    channel.on('ChannelMessage', async(messageData, memberId) =>{
        let data = JSON.parse(messageData.text)
        let name = data.displayName
        addMessageToDom(data.message, memberId, name)
        
        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
        
    })

    let addParticipantToDom =  async(memberId) => {
        let {name} = await rtmClient.getUserAttributesByKeys(memberId, ['name'])
        let membersWrapper = document.getElementById('member__list')
        
        let memberItem =`<div class="member__wrapper" id="member__${memberId}__wrapper">
                            <span class="green__icon"></span>
                            <p class="member_name">${name}</p>
                        </div>`
        membersWrapper.innerHTML += memberItem              

    }

    let addMessageToDom = (messageData, memberId, displayName) => {
        let created = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
        
        let messsagesWrapper = document.getElementById('messages')
      //  let messageItem = `<div class="message__wrapper">
      //                     <small>${created}</small>
      //                     <p>${displayName}</p>
      //                     <p class="message">${messageData}</p>
      //                     </div> >`
        let messageItem=`<div class="message__wrapper"
                        <img class="avatar__md" src="images/5.png" />

                        <div class="message__body">
                        <strong class="message__author">${displayName}</strong>
                        <small class="message__timestamp">${created}</small>
                        <p class="message__text">${messageData}</p>
                        </div>
                    </div>`
    
    messsagesWrapper.insertAdjacentHTML('beforeend', messageItem)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    let sendMessage = async(e) =>{
        e.preventDefault()
        let message = e.target.message.value
        channel.sendMessage({text:JSON.stringify({'message':message, 'displayName':displayName})})
        addMessageToDom(message, uid, displayName)
        e.target.reset()
    }

let updateParticipantTotal = (participants) => {
    console.log('PARTICIPANTS:', participants)
    let total = document.getElementById('members__count')
    total.innerText = participants.length
}

    let getParticipants = async () => {
        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
        for (let i=0; participants.length > i;i++) {
            addParticipantToDom(participants[i])
        }
    }
    let removeParticipantFromDom = (memberId) => {
        document.getElementById(`member__${memberId}__wrapper`).remove()
    }

    let leaveChannel = async () => {
        await channel.leave()
        await rtmClient.logout()
    }

    window.addEventListener("beforeunload", leaveChannel)
    getParticipants()

    let messageForm = document.getElementById('message__form')
    messageForm.addEventListener('submit', sendMessage)
}

initiate()