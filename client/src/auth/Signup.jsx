
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
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
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
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
        <span className="auth-nav-note">Already a member? <Link to="/login">Log in</Link></span>
      </header>
      <main className="auth-main">
        <section className="auth-intro">
          <span className="auth-eyebrow">Make every interview collaborative</span>
          <h1>Build better<br /><em>connections.</em></h1>
          <p>Create your CodeMeet account and bring candidates and interviewers into one calm, focused workspace.</p>
          <div className="auth-note"><span className="auth-note-mark">{"</>"}</span><span>Shared code. Clear thinking. Great interviews.</span></div>
        </section>
        <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <p>Join CodeMeet and start collaborating.</p>

        {error && <div className="auth-error">{error}</div>}

        <label className="auth-field">Full name<input
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
        /></label>

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
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          required
          autoComplete="new-password"
        /></label>

        <label className="auth-field">I am joining as<select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="candidate">Candidate</option>
          <option value="interviewer">Interviewer</option>
        </select></label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
      </main>
    </div>
  );
}

export default Signup;
