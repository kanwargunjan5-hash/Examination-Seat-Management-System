import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Signin.module.css";


export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      alert("Login failed: " + authError.message);
      return;
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle(); // won't crash if row is missing

    const role = profile?.role || "student"; // default to student

    if (role === "admin") navigate("/admin");
    else navigate("/student");
  };

  return (
    <div className={styles.signinWrapper}>
      <div className={styles.signinPage}>
        <div className={styles.navbarSI}>
          <h1>Exam Seating Management System</h1>
        </div>

        <div className={styles.overlaySI}>
          <div className={styles.signinContainer}>
            <h1>Login</h1>
            <form onSubmit={handleSignin} className={styles.signinForm}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.signinInput}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.signinInput}
                required
              />
              <button type="submit" className={styles.signinBtn}>
                Login
              </button>
            </form>
            <p>
              Don't have an account?{" "}
              <a href="/signup" className={styles.signupLink}>
                Signup
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
