import { Link, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./compinents/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ImageUpload from "./pages/ImageUpload";

function Navigation() {
  const { token, logout } = useAuth();

  return (
    <header className="site-header">
      <Link className="brand" to="/register" aria-label="Account Portal home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>Account Portal</span>
      </Link>
      <nav aria-label="Main navigation">
        {!token ? (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link nav-link-primary" to="/register">Create account</Link>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/upload">Image upload</Link>
            <button className="nav-link nav-button" type="button" onClick={logout}>
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navigation />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/upload" element={<ImageUpload />} />
            </Route>

            <Route path="*" element={<p className="form-message">Page not found</p>} />
          </Routes>
        </main>
        <footer className="site-footer">A simple, secure space for your account and images.</footer>
      </div>
    </AuthProvider>
  );
}

export default App;