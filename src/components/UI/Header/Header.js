import "./Header.scss";
import logo from "../../../images/p2p_logo.png"
const Header = () => {
    return (
        <div className="header">
            <div className="logo">
                <img src={logo} alt="logo" />
                <span className="help-text">
                    Meet
                </span>
            </div>
        </div>
    );
}

export default Header;