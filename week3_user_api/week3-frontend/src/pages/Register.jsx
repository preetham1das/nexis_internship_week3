import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (form.name.trim().length < 2) {
      setMessage("Name must contain at least 2 characters");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must contain at least 6 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_URL}/api/users/register`,
        {
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase()
        }
      );

      setMessage(response.data.message);
      setIsSuccess(true);
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || (
        error.response
          ? "Registration failed. Please try again."
          : "Cannot reach the API. Check that the backend is running and open the frontend on the same computer or local network."
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="card-icon" aria-hidden="true">✦</div>
      <p className="eyebrow">GET STARTED</p>
      <h1>Create your account</h1>
      <p className="card-intro">Join us to securely manage and share your images.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          name="name"
          type="text"
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        <p className="field-hint">Use at least 6 characters.</p>

        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
        {message && (
          <p className={`form-message ${isSuccess ? "success" : "error"}`} role="status">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}