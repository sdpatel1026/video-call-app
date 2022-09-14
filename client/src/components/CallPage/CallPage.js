import "./CallPage.scss"
import CallPageHeader from "./../UI/CallPageHeader/CallPageHeader";
import Alert from "../UI/Alert/Alert";
import MeetingInfo from "../UI/MeetingInfo/MeetingInfo";
import CallPageFooter from "../UI/CallPageFooter/CallPageFooter";
import Messenger from "../UI/Messenger/Messenger"
import MessageListReducer from "./../../reducers/MessageListReducer";
import { useHistory } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import {
    BASE_URL,
    GET_CALL_ID,
    SAVE_CALL_ID,
} from "./../../utils/apiEndpoints";
import { getRequest, postRequest } from "./../../utils/apiRequest";
import { useParams } from "react-router-dom";
import { useEffect, useState, useReducer } from "react";

let peer = null
const socket = io.connect("http://localhost:4000");
const initialState = [];

const CallPage = () => {
    console.log("CallPage()...")
    const history = useHistory();
    let { id } = useParams();
    const isAdmin = window.location.hash == "#init" ? true : false;
    const meetUrl = `${window.location.origin}${window.location.pathname}`;
    let alertTimeout = null;
    const [messageList, messageListReducer] = useReducer(
        MessageListReducer,
        initialState
    );
    const [streamObj, setStreamObj] = useState();
    const [screenCastStream, setScreenCastStream] = useState();
    const [meetInfoPopup, setMeetInfoPopup] = useState(false);
    const [isPresenting, setIsPresenting] = useState(false);
    const [isMessenger, setIsMessenger] = useState(false);
    const [messageAlert, setMessageAlert] = useState({});
    const [isAudio, setIsAudio] = useState(true);

    useEffect(() => {
        console.log("useEffect()...")
        if (isAdmin) {
            setMeetInfoPopup(true)
        }
        initWebRTC();
        socket.on("code", (data) => {
            console.log("callPage-socket.on(code)");
            if (data.meetUrl === meetUrl) {
                peer.signal(data.code);
            }
        });
    }, []);

    const getRecieverCode = async () => {
        console.log("getRecieverCode");
        const response = await getRequest(`${BASE_URL}${GET_CALL_ID}/${id}`);
        console.log("response:", response)
        if (response.code) {
            console.log("peer.signal(signal)-passing");
            peer.signal(response.code);
        } else {
            console.log("something went wrong while getting requested data..", response.code)
        }
    };
    const initWebRTC = () => {
        console.log("initWebRTC");
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream) => {
                console.log("getUserMedia==>then");
                setStreamObj(stream);

                peer = new Peer({
                    initiator: isAdmin,
                    trickle: false,
                    stream: stream,
                });

                if (!isAdmin) {
                    getRecieverCode();
                }

                //signal is coming
                peer.on("signal", async (data) => {
                    console.log("callPage-peer.on(signal)");
                    if (isAdmin) {
                        let payload = {
                            id,
                            signalData: data,
                        };
                        await postRequest(`${BASE_URL}${SAVE_CALL_ID}`, payload);
                    } else {
                        console.log("trying to emit code through socket")
                        socket.emit("code", { code: data, meetUrl }, (cbData) => {
                            console.log("callPage-socket.emit(code)-code sent");
                        });

                    }
                });

                peer.on("connect", () => {
                    // wait for 'connect' event before using the data channel
                    console.log('I am connected now')
                });
                //Below syntax tell that data is coming.
                peer.on("data", (data) => {
                    console.log("callPage-peer.on(data)");
                    clearTimeout(alertTimeout);
                    messageListReducer({
                        type: "addMessage",
                        payload: {
                            user: "other",
                            msg: data.toString(),
                            time: Date.now(),
                        },
                    });

                    setMessageAlert({
                        alert: true,
                        isPopup: true,
                        payload: {
                            user: "other",
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
                });
                //stream is coming
                peer.on("stream", (stream) => {
                    console.log("callPage-peer.on(stream)");
                    // got remote video stream, now let's show it in a video tag
                    let video = document.querySelector("video");

                    if ("srcObject" in video) {
                        video.srcObject = stream;
                    } else {
                        video.src = window.URL.createObjectURL(stream); // for older browsers
                    }

                    video.play();
                });

            })
            .catch(() => { });
    };

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
            <video className="video-container" src="" controls></video>
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

