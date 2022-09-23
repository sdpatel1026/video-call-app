import "./CallPage.scss"
import CallPageHeader from "./../UI/CallPageHeader/CallPageHeader";
import Alert from "../UI/Alert/Alert";
import MeetingInfo from "../UI/MeetingInfo/MeetingInfo";
import CallPageFooter from "../UI/CallPageFooter/CallPageFooter";
import Messenger from "../UI/Messenger/Messenger"
import MessageListReducer from "./../../reducers/MessageListReducer";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import {
    BASE_URL,
    JOIN_ROOM,
} from "./../../utils/apiEndpoints";
import { getRequest, postRequest } from "./../../utils/apiRequest";
import { useParams } from "react-router-dom";
import { useEffect, useState, useReducer, useRef } from "react";


let peer = null
let socket = null;
const initialState = [];

const CallPage = () => {
    console.log("CallPage()...")
    const history = useHistory();
    let { id } = useParams();
    const joinUrl = `${BASE_URL}${JOIN_ROOM}?roomID=${id}`;
    const meetUrl = `${window.location.origin}${window.location.pathname}`;
    console.log("meeturl: ", meetUrl)
    const isAdmin = window.location.hash == "#init" ? true : false;
    let alertTimeout = null;
    const userVideo = useRef();
    const userStream = useRef();
    const partnerVideo = useRef();
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

    useEffect(() => {
        socket = io.connect(joinUrl)
        if (isAdmin) {
            setMeetInfoPopup(true)
        }
        initWebRTC();
    }, []);

    const initWebRTC = () => {
        console.log("trying to initialise webRTC.")
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true
            })
            .then((stream) => {
                setStreamObj(stream)
                userVideo.current.srcObject = stream
                userStream.current = stream
                io.on("connection", () => {
                    console.log("connected to the room")
                    io.emmit("join", { join: "true" });
                })


            })
            .catch(() => { });
    }



    const sendMsg = (msg) => {
        peer.send(msg);
        // peer.write(msg)
        messageListReducer({
            type: "addMessage",
            payload: {
                user: "you",
                msg: msg,
                time: Date.now(),
            },
        });
    };
    const screenShare = () => {
        navigator.mediaDevices
            .getDisplayMedia({ cursor: true })
            .then((screenStream) => {
                peer.replaceTrack(
                    streamObj.getVideoTracks()[0],
                    screenStream.getVideoTracks()[0],
                    streamObj
                );
                setScreenCastStream(screenStream);
                screenStream.getTracks()[0].onended = () => {
                    peer.replaceTrack(
                        screenStream.getVideoTracks()[0],
                        streamObj.getVideoTracks()[0],
                        streamObj
                    );
                };
                setIsPresenting(true);
            });
    };
    const stopScreenShare = () => {
        screenCastStream.getVideoTracks().forEach(function (track) {
            track.stop();
        });
        peer.replaceTrack(
            screenCastStream.getVideoTracks()[0],
            streamObj.getVideoTracks()[0],
            streamObj
        );
        setIsPresenting(false);
    };
    const toggleAudio = (value) => {
        streamObj.getAudioTracks()[0].enabled = value;
        setIsAudio(value);
    };
    const disConnectCall = () => {
        console.log("disconnected");
        peer.destroy();
        history.push("/");
        window.location.reload();

    };
    return (
        <div className="callpage-container">
            <video className="video-container" src="" autoPlay controls={true} ref={userVideo}></video>
            <CallPageHeader
                isMessenger={isMessenger}
                setIsMessenger={setIsMessenger}
                messageAlert={messageAlert}
                setMessageAlert={setMessageAlert} />

            {isAdmin && meetInfoPopup && (
                < MeetingInfo setMeetInfoPopup={setMeetInfoPopup} meetUrl={meetUrl} />
            )}
            <CallPageFooter
                isPresenting={isPresenting}
                stopScreenShare={stopScreenShare}
                screenShare={screenShare}
                isAudio={isAudio}
                toggleAudio={toggleAudio}
                disConnectCall={disConnectCall} />
            {isMessenger ? (
                <Messenger
                    setIsMessenger={setIsMessenger}
                    sendMsg={sendMsg}
                    messageList={messageList}
                />
            ) : (
                messageAlert.isPopup && <Alert messageAlert={messageAlert} />
            )}
        </div>
    );
};

export default CallPage;

