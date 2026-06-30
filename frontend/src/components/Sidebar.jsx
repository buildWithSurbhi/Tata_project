import {
  FaThLarge,
  FaVideo,
  FaChartBar,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <div>

        <h1 className="logo">
          SafeEdge
          <span>AI</span>
        </h1>

        <p className="node-status">
          ● EDGE NODE : ONLINE
        </p>

        <div className="sidebar-menu">

          <Link to="/" className="active">
            <FaThLarge />
            Dashboard
          </Link>

          <Link to="/live">
            <FaVideo />
            Live Stream
          </Link>

          <Link to="/analytics">
            <FaChartBar />
            Analytics
          </Link>

          <Link to="#">
            <FaCog />
            Configuration
          </Link>

        </div>

      </div>

      <div className="sidebar-bottom">

        <div className="status-box">
          System Active
        </div>

        <Link to="#">
          <FaQuestionCircle />
          Support
        </Link>

        <Link to="#">
          <FaSignOutAlt />
          Sign Out
        </Link>

      </div>

    </div>
  );
}

export default Sidebar;