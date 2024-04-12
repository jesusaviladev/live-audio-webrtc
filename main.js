import { createWebSocket } from './websocket';

const socket = createWebSocket(import.meta.env.VITE_APP_WEBSOCKET_URL);
// SERVERS STUN
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};
// Globals para la conexion
const RTC = new RTCPeerConnection(servers);
let localAudioStream = null;
let remoteAudioStream = null;

// Elementos del DOM
const microphoneButton = document.getElementById('microphoneButton');
const callButton = document.getElementById('callButton');
const answerButton = document.getElementById('answerButton');
const remoteAudio = document.getElementById('audio');

socket.onmessage = async function (event) {
  console.log(`[message] Datos recibidos del servidor: ${event.data}`);

  const data = JSON.parse(event.data);

  // si recibimos respuesta
  if (!RTC.currentRemoteDescription && data.type === 'answer') {
    const { id, ...answer } = data;
    const answerDescription = new RTCSessionDescription(answer);
    RTC.setRemoteDescription(answerDescription);
  }
  // si recibimos candidatos de respuesta
  if (data.type === 'answerCandidates') {
    const { data: iceCandidateData } = data;
    const iceCandidate = new RTCIceCandidate(iceCandidateData);
    RTC.addIceCandidate(iceCandidate);
  }

  // si recibimos oferta

  if (data.type === 'offer') {
    const { id, ...offerDescription } = data;

    await RTC.setRemoteDescription(new RTCSessionDescription(offerDescription));
  }

  // si recibimos candidatos de oferta
  if (data.type === 'offerCandidates') {
    const { data: iceCandidateData } = data;

    RTC.addIceCandidate(new RTCIceCandidate(iceCandidateData));
  }
};

const openMicrophone = async () => {
  // Pedimos acceso al microfono
  localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  localAudioStream
    .getTracks()
    .forEach((track) => RTC.addTrack(track, localAudioStream));

  remoteAudioStream = new MediaStream();
  // al llegar un evento escuchamos y agregamos el track
  RTC.ontrack = (event) => {
    event.streams[0]
      .getTracks()
      .forEach((track) => remoteAudioStream.addTrack(track));
  };

  remoteAudio.srcObject = remoteAudioStream;

  callButton.disabled = false;
  remoteAudio.controls = true;
  remoteAudio.play();
};

const createOffer = async () => {
  RTC.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(
        JSON.stringify({
          type: 'offerCandidates',
          data: event.candidate.toJSON(),
        })
      );
    }
  };

  // creamos la oferta
  const offerDescription = await RTC.createOffer();
  await RTC.setLocalDescription(offerDescription);

  const offer = {
    id: crypto.randomUUID(),
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  socket.send(JSON.stringify(offer));
};

const createAnswer = async () => {
  RTC.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(
        JSON.stringify({
          type: 'answerCandidates',
          data: event.candidate.toJSON(),
        })
      );
    }
  };

  // creamos la respuesta
  const answerDescription = await RTC.createAnswer();
  await RTC.setLocalDescription(answerDescription);

  const answer = {
    id: crypto.randomUUID(),
    sdp: answerDescription.sdp,
    type: answerDescription.type,
  };

  socket.send(JSON.stringify(answer));
};

microphoneButton.addEventListener('click', openMicrophone);
callButton.addEventListener('click', createOffer);
answerButton.addEventListener('click', createAnswer);
