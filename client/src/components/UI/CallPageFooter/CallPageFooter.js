import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faVideo,
    faMicrophone,
    faPhone,
    faAngleUp,
    faClosedCaptioning,
    faDesktop,
    faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import "./CallPageFooter.scss";


const CallPageFooter = () => {

    return (
        <div className="footer-item">
            <div className="left-item">
                <div className="icon-block">
                    Meeting details
                    <FontAwesomeIcon className="icon" icon={faAngleUp} />
                </div>
            </div>
            <div className="center-item">
                <div className="icon-block">
                    <FontAwesomeIcon
                        className="icon"
                        icon={faMicrophone}
                    />
                </div>
                <div className="icon-block">
                    <FontAwesomeIcon className="icon" icon={faPhone} />
                </div>
                <div className="icon-block">
                    <FontAwesomeIcon className="icon" icon={faVideo} />
                </div>
            </div>
            <div className="right-item">
                <div className="icon-block">
                    <FontAwesomeIcon className="icon" icon={faClosedCaptioning} />
                    <p className="title">Turn on captions</p>
                </div>
                <div className="icon-block">
                    <FontAwesomeIcon className="icon" icon={faDesktop} />
                    <p className="title">Stop presenting</p>
                </div>

            </div>
        </div>
    );
};

export default CallPageFooter;