import "./CallPage.scss"
import CallPageHeader from "./../UI/CallPageHeader/CallPageHeader";
import Alert from "../UI/Alert/Alert";
import MeetingInfo from "../UI/MeetingInfo/MeetingInfo";
import CallPageFooter from "../UI/CallPageFooter/CallPageFooter";
import Messenger from "../UI/Messenger/Messenger"
import MessageListReducer from "./../../reducers/MessageListReducer";
import { useHistory } from "react-router-dom";
import {
    JOIN_ROOM,
    SERVER_BASE_URL_WS,
} from "./../../utils/apiEndpoints";
import { useParams } from "react-router-dom";
import { useEffect, useState, useReducer, useRef } from "react";


const initialState = [];
let peer = null
let channel = null
const CallPage = () => {
    console.log("CallPage()...")
    const history = useHistory();
    let { id } = useParams();
    const joinUrl = `${SERVER_BASE_URL_WS}${JOIN_ROOM}?room_id=${id}`;
    const meetUrl = `${window.location.origin}${window.location.pathname}`;
    // const isAdmin = window.location.hash == "#init" ? true : false;
    let alertTimeout = null;
    const userVideo = useRef();
    const localStream = useRef();
    const partnerVideo = useRef();
    const webSocketRef = useRef();
    const peerRef = useRef();
    const [messageList, messageListReducer] = useReducer(
        MessageListReducer,
        initialState
    );
    const [streamObj, setStreamObj] = useState();
    const [peerStream, setPeerStream] = useState();
    const [screenCastStream, setScreenCastStream] = useState();
    const [meetInfoPopup, setMeetInfoPopup] = useState(false);
    const [isPresenting, setIsPresenting] = useState(false);
    const [isMessenger, setIsMessenger] = useState(false);
    const [messageAlert, setMessageAlert] = useState({});
    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true)

    useEffect(() => {

        initWebRTC();
    }, []);

    const initWebRTC = () => {
        console.log("trying to initialise webRTC.")
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream) => {
                // setStreamObj(stream)
                // userVideo.current.srcObject = stream
                localStream.current = stream
                userVideo.current.srcObject = stream
                webSocketRef.current = new WebSocket(joinUrl)
                webSocketRef.current.addEventListener("open", () => {
                    console.log("websocket event listner:open")
                    webSocketRef.current.send(JSON.stringify({ join: true }));
                });
                webSocketRef.current.addEventListener("message", async (e) => {
                    console.log("getting some signal")
                    const message = JSON.parse(e.data);
                    if (message.join) {
                        callUser();
                    }

                    if (message.offer) {
                        handelOffer(message.offer);
                    }

                    if (message.answer) {
                        console.log("receiving answer");
                        peerRef.current.setRemoteDescription(
                            new RTCSessionDescription(message.answer)
                        );
                    }
                    if (message.iceCandidate) {
                        console.log("Receiving and Adding ICE Candidate");
                        try {
                            await peerRef.current.addIceCandidate(
                                message.iceCandidate
                            );
                        } catch (err) {
                            console.log("Error Receiving ICE Candidate", err);
                        }
                    }
                });

            })
            .catch(() => { });
    }



    const sendMsg = (msg) => {
        if (channel) {
            channel.send(msg)
            messageListReducer({
                type: "addMessage",
                payload: {
                    user: "You",
                    msg: msg,
                    time: Date.now(),
                },
            });
        } else {
            alert("Sorry! No one is there to receive your message")
        }

    };
    const screenShare = () => {
        navigator.mediaDevices
            .getDisplayMedia({ cursor: true })
            .then((screenStream) => {
                peerRef.current.replaceTrack(
                    localStream.current.getVideoTracks()[0],
                    screenStream.getVideoTracks()[0],
                    localStream.current
                );
                setScreenCastStream(screenStream);
                screenStream.getTracks()[0].onended = () => {
                    peerRef.current.replaceTrack(
                        screenStream.getVideoTracks()[0],
                        localStream.current.getVideoTracks()[0],
                        localStream.current
                    );
                };
                setIsPresenting(true);
            });
    };
    const stopScreenShare = () => {
        screenCastStream.getVideoTracks().forEach(function (track) {
            track.stop();
        });
        peerRef.current.replaceTrack(
            screenCastStream.getVideoTracks()[0],
            localStream.current.getVideoTracks()[0],
            localStream.current
        );
        setIsPresenting(false);
    };
    const toggleAudio = (value) => {
        localStream.current.getAudioTracks()[0].enabled = value;
        setIsAudio(value);
    };
    const toggleVideo = (value) => {
        console.log("toggling video:", value)
        localStream.current.getVideoTracks()[0].enabled = value;
        setIsVideo(value)
    }
    const disConnectCall = () => {

        if (peerRef.current) {
            peerRef.current.onnegotiationneeded = null;
            peerRef.current.onicecandidate = null;
            peerRef.current.ontrack = null;
            peerRef.current.ondatachannel = null;
            channel.close();
            peerRef.current.close();
            console.log("disconnected");
        }

        history.push("/");
        window.location.reload();

    };
    const createPeer = () => {
        console.log("Creating Peer Connection");
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peer.onnegotiationneeded = handleNegotiationNeeded;
        peer.onicecandidate = handleIceCandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.ondatachannel = handleDataChannel;
        channel = peer.createDataChannel('data');
        channel.onmessage = handleMessage;

        return peer;
    };
    const handelOffer = async (offer) => {
        console.log("offer received, creating answer");
        peerRef.current = createPeer();
        await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
        )
        localStream.current.getTracks().forEach((track) => {
            peerRef.current.addTrack(track, localStream.current);
        });
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        webSocketRef.current.send(
            JSON.stringify({ answer: peerRef.current.localDescription })
        );
    };
    const callUser = () => {
        console.log("Calling Other User");
        peerRef.current = createPeer();

        localStream.current.getTracks().forEach((track) => {
            peerRef.current.addTrack(track, localStream.current);
        });
    };


    const handleDataChannel = (e) => {
        console.log("trying to handle data channel");
        channel = e.channel;
        channel.onmessage = handleMessage;

    }
    const handleNegotiationNeeded = async () => {
        console.log("Creating Offer");

        try {
            const myOffer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(myOffer);

            webSocketRef.current.send(
                JSON.stringify({ offer: peerRef.current.localDescription })
            );
        } catch (err) {
            console.log("getting error during handling negotiation:", err)
        }
    };

    const handleIceCandidateEvent = (e) => {
        console.log("Found Ice Candidate");
        if (e.candidate) {
            console.log(e.candidate);
            webSocketRef.current.send(
                JSON.stringify({ iceCandidate: e.candidate })
            );
        }
    };

    const handleTrackEvent = (e) => {
        console.log("Received Tracks");
        partnerVideo.current.srcObject = e.streams[0];
    };
    const handleMessage = (e) => {
        console.log("trying to handle incoming message:", e.data)
        let data = e.data
        clearTimeout(alertTimeout);
        messageListReducer({
            type: "addMessage",
            payload: {
                user: "Peer",
                msg: data.toString(),
                time: Date.now(),
            },
        });


        setMessageAlert({
            alert: true,
            isPopup: true,
            payload: {
                user: "Peer",
                msg: data.toString(),
            },
        });

        alertTimeout = setTimeout(() => {
            setMessageAlert({
                ...messageAlert,
                isPopup: false,
                payload: {},
            });
        }, 10000);
    };
    return (
        <div className="callpage-container">

            <video className="partner-video-container" src="" autoPlay controls={true} ref={partnerVideo}></video>
            <video className="user-video-container" src="" autoPlay controls={true} ref={userVideo}></video>
            <CallPageHeader
                isMessenger={isMessenger}
                setIsMessenger={setIsMessenger}
                messageAlert={messageAlert}
                setMessageAlert={setMessageAlert} />

            {
                meetInfoPopup && (
                    < MeetingInfo setMeetInfoPopup={setMeetInfoPopup} meetUrl={meetUrl} />
                )
            }
            <CallPageFooter
                isPresenting={isPresenting}
                stopScreenShare={stopScreenShare}
                screenShare={screenShare}
                isAudio={isAudio}
                toggleAudio={toggleAudio}
                isVideo={isVideo}
                toggleVideo={toggleVideo}
                disConnectCall={disConnectCall}
                meetInfoPopup={meetInfoPopup}
                setMeetInfoPopup={setMeetInfoPopup} />
            {
                isMessenger ? (
                    <Messenger
                        setIsMessenger={setIsMessenger}
                        sendMsg={sendMsg}
                        messageList={messageList}
                    />
                ) : (
                    messageAlert.isPopup && <Alert messageAlert={messageAlert} />
                )
            }
        </div >
    );
};

export default CallPage;

