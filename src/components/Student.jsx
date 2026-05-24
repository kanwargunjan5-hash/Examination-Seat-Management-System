import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Student.module.css";

export default function Student() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rollNumber, setRollNumber] = useState("");
  const [seatData, setSeatData] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate("/signin");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (!profile || profile.role !== "student") return navigate("/admin");
      setUser(userData.user);
      setLoading(false);
    }

    checkAuth();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSeatData(null);

    if (!rollNumber) return setError("Please enter a roll number");

    const { data, error } = await supabase
      .from("mock_exam_data")
      .select("*")
      .eq("rollNumber", rollNumber.toUpperCase())
      .single();

    if (error || !data)
      return setError("No seat allocation found for this roll number");

    setSeatData(data);
  };

  const renderSeatGrid = () => {
    if (!seatData) return null;
    const rows = 6;
    const cols = 6;
    const grid = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const isStudentSeat = seatData.row === r && seatData.col === c;
        grid.push(
          <div
            key={`${r}-${c}`}
            className={`${styles.spSeat} ${
              isStudentSeat ? styles.spStudent : styles.spEmpty
            }`}
          >
            {isStudentSeat ? "★" : (r - 1) * cols + c}
          </div>
        );
      }
    }

    return <div className={styles.spSeatGrid}>{grid}</div>;
  };

  const toggleDarkMode = () => {
  setDarkMode((prev) => !prev);
  };

  return (
    <div  className={`${styles.spPageWrapper} ${
      darkMode ? styles.darkMode : ""
    }`}>
      {/* Navbar */}
      <nav className={styles.spNavbar}>
        <div className={styles.spNavbarTitle}>Student Panel</div>
        <button
          className={styles.spDarkModeBtn}
          onClick={toggleDarkMode}
        >
          {darkMode ? "Light" : "Dark"}
        </button>
        <button className={styles.spLogoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Main Container */}
      <div className={styles.spContainer}>
        <header className={styles.spHeader}>
          <h1>Exam Seat Finder</h1>
          <p className={styles.spSubtitle}>
            Enter your Enrollment number to find your allocated seat for the
            upcoming examination
          </p>
        </header>

        {/* Search Card */}
        <div className={styles.spCard}>
          <form className={styles.spSearchForm} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter your Enrollment number. Example (MUR2300307)"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className={styles.spInput}
            />
            <button className={styles.spSearchBtn} type="submit">
              Find My Seat
            </button>
          </form>
        </div>

        {error && <div className={styles.spErrorCard}>{error}</div>}

        {seatData && (
          <>
            {/* Seat Info Card */}
            <div className={`${styles.spCard} ${styles.spResultCard}`}>
              <div className={styles.spResultHeader}>
                <h3 className={styles.spResultTitle}>Your Seat Allocation</h3>
              </div>

              <div className={styles.spResultGrid}>
                <div>
                  <div className={styles.spStudentName}>
                    {seatData.studentName}
                  </div>

                  <div className={styles.spInfoItem}>
                    <p className={styles.spInfoLabel}>Room</p>
                    <p className={styles.spInfoValue}>{seatData.roomNumber}</p>
                  </div>

                  <div className={styles.spInfoItem}>
                    <p className={styles.spInfoLabel}>🏢 Floor</p>
                    <p className={styles.spInfoValue}>{seatData.floor}</p>
                  </div>

                  <div className={styles.spBadge}>
                    Seat {seatData.seatNumber}
                  </div>
                </div>

                <div>
                  <div className={styles.spInfoItem}>
                    <p className={styles.spInfoLabel}>Date</p>
                    <p className={styles.spInfoValue}>{seatData.examDate}</p>
                  </div>
                  <div className={styles.spInfoItem}>
                    <p className={styles.spInfoLabel}>Time</p>
                    <p className={styles.spInfoValue}>{seatData.examTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Layout */}
            <div className={styles.spHallLayout}>
              <div className={styles.spHallTitle}>Exam Hall Layout</div>
              <div className={styles.spFrontIndicator}>Front of Hall</div>
              {renderSeatGrid()}
            </div>

            {/* Legend */}
            <div className={styles.spLegend}>
              <div className={styles.spLegendItem}>
                <div
                  className={styles.spLegendColor}
                  style={{ backgroundColor: "#9b59b6" }}
                ></div>
                <span>Your Seat</span>
              </div>
              <div className={styles.spLegendItem}>
                <div
                  className={styles.spLegendColor}
                  style={{ backgroundColor: "#f2f2f2", border: "1px solid #444" }}
                ></div>
                <span>Empty Seat</span>
              </div>
            </div>

            {/* Instructions */}
            <div className={styles.spInstructions}>
              <h4>Exam Instructions:</h4>
              <ul>
                <li> Arrive 30 minutes before the exam time</li>
                <li> Bring a valid ID and your admit card</li>
                <li> Mobile phones are strictly prohibited</li>
                <li> Only permitted stationery is allowed</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
