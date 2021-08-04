import './style.css'

import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBayxDYyjcglnz61-YHgdz0h1YVkrL4cBI",
  authDomain: "karaoke-b9361.firebaseapp.com",
  projectId: "karaoke-b9361",
  storageBucket: "karaoke-b9361.appspot.com",
  messagingSenderId: "152169262096",
  appId: "1:152169262096:web:0f944cd70bfd4f6efdee95",
  measurementId: "G-FP6G8017CV"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const firestore = firebase.firestore()

const servers = {
  iceServers: [
    {
      urls: [ 'stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
    },
  ],
  iceCandidatePoolSize: 10,
}

let pc = new RTCPeerConnection()
let localStream = null
let remoteStream = null

const webcamButton = document.getElementById('webcamButton')
const webcamVideo = document.getElementById('webcamVideo')
const callButton = document.getElementById('callButton')
const callInput = document.getElementById('callInput')
const answerButton = document.getElementById('answerButton')
const  hangupButton = document.getElementById(' hangupButton')

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({video:true, audio: true})
  remoteStream = new MediaStream()

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream)
  })

  pc.ontrack = event => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track)
    })
  }

  webcamVideo.srcObject = localStream
  remoteVideo.srcObject = remoteStream

  callButton.disabled = false
  answerButton.disabled = false
  webcamButton.disabled = true

}

callButton.onclick = async () => {
  const callDoc = firestore.collection('calls').doc()
  const offerCandidates = callDoc.collection('offerCandidates')
  const answerCandidates = callDoc.collection('answerCandidates')

  callInput.value = callDoc.id

  pc.onicecandidate = event => {
    event.candidate && offerCandidates.add(event.candidate.toJSON())
  }

  const offerDescription = await pc.createOffer()
  await pc.setLocalDescription(offerDescription)

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  }

  await callDoc.set({offer})

  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data()
    if(!pc.currentRemoteDescription && data?.answer)
      answerDescription = new RTCSessionDescription(data.answer)
      pc.setRemoteDescription(answerDescription)
  })

  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if(change.type === 'added'){
        const candidate = new RTCIceCandidate(change.doc.data())
        pc.addIceCandidate(candidate)
      }
    })
  })

  hangupButton.disabled = false
}

answerButton.onclick = async () => {
  const callId = callInput.value
  const callDoc = firestore.collection('calls').doc(callId)
  const answerCandidates = callDoc.collection('answerCandidates')
  const offerCandidate= callDoc.collection('offerCandidate')

  pc.onicecandidate = event => {
    event.candidate && answerCandidates.add(event.candidate.toJSON())
  }

  const offerDescription = callData.offer
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription))

  const answerDescription = await pc.createAnswer()
  await pc.setLocalDescription(answerDescription)

  const answer ={
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  }

  await callDoc.update({answer})

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change)
      if(change.type === 'added'){
        let data = change.doc.data()
        pc.addIceCandidate(new RTCIceCandidate(data))
      }
    })
  })
}