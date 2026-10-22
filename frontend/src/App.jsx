import { Routes, Route, Outlet, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";

// Navbar on top, page content in the middle, footer at the bottom
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ink py-4 text-center text-sm text-white/80">
        KitabAura - A multilingual digital library
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <p className="mt-2 text-muted">This page does not exist (yet).</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-primary underline">
        Back to home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
      </Route>
    </Routes>
  );
}