import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faVideo,
    faMicrophone,
    faPhone,
    faAngleUp,
    faClosedCaptioning,
    faDesktop,
    faMicrophoneSlash,
    faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import "./CallPageFooter.scss";

const CallPageFooter = ({
    isPresenting,
    stopScreenShare,
    screenShare,
    isAudio,
    toggleAudio,
    isVideo,
    toggleVideo,
    disConnectCall,
    meetInfoPopup,
    setMeetInfoPopup,
}) => {
    return (
        <div className="footer-item">
            <div className="left-item">
                <div className="icon-block" onClick={() => setMeetInfoPopup(!meetInfoPopup)}>
                    Meeting details
                    <FontAwesomeIcon className="icon" icon={faAngleUp} />
                </div>
            </div>
            <div className="center-item">
                <div className={`icon-block ${!isAudio ? "red-bg" : null}`}
                    onClick={() => toggleAudio(!isAudio)}>
                    <FontAwesomeIcon
                        className="icon"
                        icon={isAudio ? faMicrophone : faMicrophoneSlash}
                    />
                </div>
                <div className="icon-block" onClick={disConnectCall}>
                    <FontAwesomeIcon className="icon red" icon={faPhone} />
                </div>
                <div className={`icon-block ${!isVideo ? "red-bg" : null}`}
                    onClick={() => toggleVideo(!isVideo)}>
                    <FontAwesomeIcon className="icon" icon={isVideo ? faVideo : faVideoSlash} />
                </div>
            </div>
            <div className="right-item">
                <div className="icon-block">
                    <FontAwesomeIcon className="icon red" icon={faClosedCaptioning} />
                    <p className="title">Turn on captions</p>
                </div>
                {isPresenting ? (
                    <div className="icon-block" onClick={stopScreenShare}>
                        <FontAwesomeIcon className="icon red" icon={faDesktop} />
                        <p className="title">Stop presenting</p>
                    </div>) : (
                    <div className="icon-block" onClick={screenShare}>
                        <FontAwesomeIcon className="icon red" icon={faDesktop} />
                        <p className="title">Present Now</p>
                    </div>
                )}


            </div>
        </div>
    );
};

export default CallPageFooter;