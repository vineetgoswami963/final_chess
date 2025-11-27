
// import React, { useEffect, useState, useRef } from 'react';
// import Peer from "simple-peer";
// import styled from "styled-components";
// const socket = require('../connection/socket').socket;

// const Container = styled.div`
//   height: 100vh;
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
// `;

// const Row = styled.div`
//   width: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const Video = styled.video`
//   border: 1px solid blue;
// `;

// function VideoChatApp(props) {
//   const [stream, setStream] = useState();
//   const [receivingCall, setReceivingCall] = useState(false);
//   const [caller, setCaller] = useState("");
//   const [callerSignal, setCallerSignal] = useState();
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const userVideo = useRef();
//   const partnerVideo = useRef();

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         if (userVideo.current) {
//           userVideo.current.srcObject = stream;
//         }
//       })
//       .catch(err => console.error("Media access error:", err));

//     socket.on("hey", (data) => {
//       console.log("Incoming call:", data);
//       setReceivingCall(true);
//       setCaller(data.from);
//       setCallerSignal(data.signal);
//     });
//   }, []);

//   function callPeer(id) {
//     setIsCalling(true);
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream: stream,
//       config: {
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]  // Public STUN server
//       }
//     });

//     peer.on("signal", data => {
//       socket.emit("callUser", { userToCall: id, signalData: data, from: props.mySocketId });
//     });

//     peer.on("stream", (stream) => {
//       if (partnerVideo.current) {
//         partnerVideo.current.srcObject = stream;
//       }
//     });

//     peer.on("error", err => console.error("Peer error:", err));
//     peer.on("close", () => console.log("Peer connection closed"));

//     socket.on("callAccepted", signal => {
//       setCallAccepted(true);
//       peer.signal(signal);
//     });
//   }

//   function acceptCall() {
//     setCallAccepted(true);
//     setIsCalling(false);
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: stream,
//       config: {
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//       }
//     });

//     peer.on("signal", data => {
//       socket.emit("acceptCall", { signal: data, to: caller });
//     });

//     peer.on("stream", (stream) => {
//       if (partnerVideo.current) {
//         partnerVideo.current.srcObject = stream;
//       }
//     });

//     peer.on("error", err => console.error("Peer error:", err));
//     peer.signal(callerSignal);
//   }

//   let UserVideo;
//   if (stream) {
//     UserVideo = (
//       <Video playsInline muted ref={userVideo} autoPlay style={{ width: "50%", height: "50%" }} />
//     );
//   }

//   let mainView;

//   if (callAccepted) {
//     mainView = (
//       <Video playsInline ref={partnerVideo} autoPlay style={{ width: "100%", height: "100%" }} />
//     );
//   } else if (receivingCall) {
//     mainView = (
//       <div>
//         <h1>{props.opponentUserName} is calling you</h1>
//         <button onClick={acceptCall}><h1>Accept</h1></button>
//       </div>
//     );
//   } else if (isCalling) {
//     mainView = (
//       <div>
//         <h1>Currently calling {props.opponentUserName}...</h1>
//       </div>
//     );
//   } else {
//     mainView = (
//       <button onClick={() => callPeer(props.opponentSocketId)}>
//         <h1>Chat with your friend while you play!</h1>
//       </button>
//     );
//   }

//   return (
//     <Container>
//       <Row>
//         {mainView}
//         {UserVideo}
//       </Row>
//     </Container>
//   );
// }

// export default VideoChatApp;
import React, { useEffect, useState, useRef } from 'react';
import Peer from "simple-peer";
import styled from "styled-components";
const socket = require('../connection/socket').socket;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
`;

const VideoFrame = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SmallVideo = styled.video`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 30%;
  height: auto;
  border-radius: 6px;
  border: 2px solid white;
  z-index: 10;
  object-fit: cover;
`;

const CallButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #27ae60;
  }
`;

const StatusText = styled.div`
  text-align: center;
  margin-top: 10px;
  font-weight: 500;
  color: white;
`;

function VideoChatApp(props) {
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const userVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    // 1. Get Media Stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Media access error:", err));

    // 2. Define Socket Listener for incoming calls
    const handleIncomingCall = (data) => {
      console.log("Incoming call from:", data.from);
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    };

    socket.on("hey", handleIncomingCall);

    // 3. Cleanup: Remove listener when component unmounts
    return () => {
      socket.off("hey", handleIncomingCall);
    };
  }, []);

  function callPeer(id) {
    setIsCalling(true);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on("signal", data => {
      socket.emit("callUser", { userToCall: id, signalData: data, from: props.mySocketId });
    });

    peer.on("stream", (stream) => {
      if (partnerVideo.current) partnerVideo.current.srcObject = stream;
    });

    // Cleanup peer events if needed or handle errors
    peer.on("error", err => console.error("Peer error (Caller):", err));

    socket.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    });
  }

  function acceptCall() {
    setCallAccepted(true);
    setIsCalling(false);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on("signal", data => {
      socket.emit("acceptCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      if (partnerVideo.current) partnerVideo.current.srcObject = stream;
    });

    peer.on("error", err => console.error("Peer error (Receiver):", err));

    peer.signal(callerSignal);
  }

  let mainView;
  if (callAccepted) {
    mainView = (
      <VideoFrame>
        <StyledVideo playsInline ref={partnerVideo} autoPlay />
        <SmallVideo playsInline muted ref={userVideo} autoPlay />
      </VideoFrame>
    );
  } else if (receivingCall) {
    mainView = (
      <div>
        <StatusText>{props.opponentUserName} is calling you...</StatusText>
        <CallButton onClick={acceptCall}>Accept Call</CallButton>
        <div style={{ marginTop: '10px', height: '150px', background: '#000', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
             <StyledVideo playsInline muted ref={userVideo} autoPlay />
        </div>
      </div>
    );
  } else if (isCalling) {
    mainView = (
      <div>
        <StatusText>Calling {props.opponentUserName}...</StatusText>
        <div style={{ marginTop: '10px', height: '150px', background: '#000', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
             <StyledVideo playsInline muted ref={userVideo} autoPlay />
        </div>
      </div>
    );
  } else {
    mainView = (
      <div>
        <VideoFrame>
            <StyledVideo playsInline muted ref={userVideo} autoPlay />
        </VideoFrame>
        <div style={{marginTop: '15px'}}>
            <CallButton onClick={() => callPeer(props.opponentSocketId)}>
            Start Video Chat
            </CallButton>
        </div>
      </div>
    );
  }

  return (
    <Container>
      {mainView}
    </Container>
  );
}

export default VideoChatApp;