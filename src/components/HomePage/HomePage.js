import "./HomePage.scss"
import Header from '../UI/Header/Header'
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { SERVER_BASE_URL_HTTP, CREATE_ROOM } from "../../utils/apiEndpoints";
import { getRequest } from "../../utils/apiRequest";
import { useState } from "react";
import meetingGridImg from "../../images/meeting_grid.jpg"


const HomePage = () => {

  const [meetingID, setMeetingID] = useState("");
  const history = useHistory();
  const startCall = async () => {
    console.log("url:", `${SERVER_BASE_URL_HTTP}${CREATE_ROOM}`)
    const response = await getRequest(`${SERVER_BASE_URL_HTTP}${CREATE_ROOM}`);
    if (response.Result) {
      const roomID = response.Result.room_id;
      history.push(`${CREATE_ROOM}/${roomID}#init`);
    } else {
      console.log("getting error in creating room: ");
    }

  };
  const joinMeeting = () => {
    if (!meetingID || (meetingID.includes("/room") || meetingID.includes("/"))) {
      setMeetingID("");
    } else {
      history.push(`/room/${meetingID}`);
    }


  }
  return (
    <div className='home-page'>
      <Header />
      <div className="body">
        <div className="left-side">
          <div className="content">
            <h2>Premium video meetings. Now free for everyone.</h2>
            <p>
              We re-engineered the service we built for secure business
              meetings, P2P Meet, to make it free and available for all.
            </p>
            <div className="action-btn">
              <button className="btn green" onClick={() => startCall()}>
                <FontAwesomeIcon className="icon-block" icon={faVideo} />
                New Meeting
              </button>
              <div className="input-block">
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input placeholder="Enter a code" type="text" value={meetingID} onChange={(e) => setMeetingID(e.target.value)} />
                </div>
                <button className="btn no-bg" onClick={() => joinMeeting()}>Join</button>
              </div>
            </div>
          </div>
          <div className="help-text">
            <a href="/">Learn more</a> about P2P Meet
          </div>
        </div>
        <div className="right-side">
          <div className="content">
            <img src={meetingGridImg} alt="meeting-grid" />
          </div>
        </div>
      </div>
    </div>)
}

export default HomePage