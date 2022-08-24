import "./CallPage.scss"
import CallPageHeader from "./../UI/CallPageHeader/CallPageHeader";
import MeetingInfo from "../UI/MeetingInfo/MeetingInfo";
import CallPageFooter from "../UI/CallPageFooter/CallPageFooter";
import Messnger from "../UI/Messenger/Messenger"
const CallPage = () => { 
    return (
        <div className="callpage-container">
            <video className="video-container" src="" controls></video>
            <CallPageHeader/>
            <MeetingInfo/>
            <CallPageFooter/>
            <Messnger/>
        </div>
    )
 }

 export default CallPage

