import { Routes, Route, Outlet, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import BookDetail from "./pages/BookDetail";
import Upload from "./pages/Upload";
import MyUploads from "./pages/MyUploads";
import Favorites from "./pages/Favorites";
import Reader from "./pages/Reader";
import MyLibrary from "./pages/MyLibrary";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Popular from "./pages/Popular";
import Challenges from "./pages/Challenges";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import RequestBook from "./pages/RequestBook";
import Requests from "./pages/admin/Requests";

// Navbar on top, page content in the middle, footer at the bottom
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ink py-4 text-center text-sm text-white/80">
        <p>KitabAura - A multilingual digital library</p>
        <p className="mt-1">
          <Link to="/browse" className="hover:underline">Browse</Link>
          {" · "}
          <Link to="/popular" className="hover:underline">Popular</Link>
          {" · "}
          <Link to="/requests" className="hover:underline">Request a book</Link>
        </p>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <p className="mt-2 text-muted">This page does not exist.</p>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/my-uploads" element={<ProtectedRoute><MyUploads /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />        
        <Route path="/requests" element={<ProtectedRoute><RequestBook /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute adminOnly><Requests /></ProtectedRoute>} />       
        <Route path="/read/:id" element={<ProtectedRoute><Reader /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
        <Route path="/welcome" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />        
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}