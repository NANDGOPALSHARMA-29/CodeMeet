import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(formData);
      navigate("/workspace");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-nav">
        <Link className="auth-brand" to="/" aria-label="CodeMeet home">
          <span className="auth-brand-mark" aria-hidden="true">{"</>"}</span><span>CodeMeet</span>
        </Link>
        <span className="auth-nav-note">New to CodeMeet? <Link to="/signup">Create an account</Link></span>
      </header>
      <main className="auth-main">
        <section className="auth-intro">
          <span className="auth-eyebrow">Collaborative coding, in sync</span>
          <h1>Good to have<br /><em>you back.</em></h1>
          <p>Pick up where you left off and get back to thoughtful, real time coding interviews.</p>
          <div className="auth-note"><span className="auth-note-mark">{"</>"}</span><span>One shared workspace. Better conversations.</span></div>
        </section>
        <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p>Log in to continue to CodeMeet.</p>

        {error && <div className="auth-error">{error}</div>}

        <label className="auth-field">Email address<input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        /></label>

        <label className="auth-field">Password<input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        /></label>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
      </main>
    </div>
  );
}

export default Login;
