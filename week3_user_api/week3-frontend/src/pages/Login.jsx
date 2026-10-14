import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login(){
    const {login} = useAuth();
    const navigate = useNavigate();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError]= useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError("");

        if(!email.trim() || !password){
            setError("Please enter email and password");
            return ;
        }
        try {
            setIsSubmitting(true);
            await login(email.trim(),password);
            navigate("/upload");
        }catch (err){
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <section className="auth-card">
            <div className="card-icon" aria-hidden="true">↗</div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1>Sign in</h1>
            <p className="card-intro">Enter your details to access your account.</p>
            <form className="form-stack" onSubmit={handleSubmit}>
                <label htmlFor="login-email">Email address</label>
                <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                />

                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    placeholder="Your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                />

                <button className="submit-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in…" : "Sign in"}
                </button>
                {error && <p className="form-message error" role="alert">{error}</p>}
                <p className="form-message">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </form>
        </section>
    );
}