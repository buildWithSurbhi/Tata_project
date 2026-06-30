import {
  FaBell,
  FaHistory,
  FaUserCircle
} from "react-icons/fa";

function Navbar() {
  return (
    <div className="navbar">

      <input
        className="search-box"
        placeholder="Search safety logs..."
      />

      <div className="navbar-right">

        <FaBell size={20} />

        <FaHistory size={20} />

        <div className="user-box">
          <FaUserCircle size={28} />

          <div>
            <strong>Officer K. Jonson</strong>
            <p>Safety Admin</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Navbar;