import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCopy,
    faTimes,
    faUser,
    faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./MeetingInfo.scss";
const MeetingInfo = ({ setMeetInfoPopup, meetUrl }) => {
    return (
        <div className="meeting-info-block">
            <div className="meeting-header">
                <h3>Meeting Info</h3>
                <FontAwesomeIcon
                    className="icon"
                    icon={faTimes}
                    onClick={() => {
                        setMeetInfoPopup(false);
                    }}
                />
            </div>
            <p className="info-text">
                share this meeting link with others you want in the meeting
            </p>
            <div className="meet-link">
                <span>{meetUrl}</span>
                <FontAwesomeIcon
                    className="icon"
                    icon={faCopy}
                    onClick={() => { navigator.clipboard.writeText(meetUrl) }}
                />
            </div>
            <div className="permission-text">
                <FontAwesomeIcon className="icon red" icon={faShieldAlt} />
                <p className="small-text">
                    People who use this meeting link must get your permission before they
                    can join.
                </p>
            </div>
        </div>
    );
};

export default MeetingInfo;