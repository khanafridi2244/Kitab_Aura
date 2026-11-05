import { Routes, Route, Outlet, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import Popular from "./pages/Popular";
import BookDetail from "./pages/BookDetail";
import Upload from "./pages/Upload";
import MyUploads from "./pages/MyUploads";
import Favorites from "./pages/Favorites";
import Reader from "./pages/Reader";
import MyLibrary from "./pages/MyLibrary";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Challenges from "./pages/Challenges";
import RequestBook from "./pages/RequestBook";
import Unsubscribe from "./pages/Unsubscribe";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Requests from "./pages/admin/Requests";
import BlogAdmin from "./pages/admin/BlogAdmin";
import BlogEditor from "./pages/admin/BlogEditor";
import CategoriesPage from "./pages/CategoriesPage";

// Navbar on top, page content in the middle, footer at the bottom
function Layout() {
  const skipToContent = (e) => {
    e.preventDefault();
    document.getElementById("main")?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
      >
        Skip to content
      </a>
      <ScrollManager />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
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
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/my-uploads" element={<ProtectedRoute><MyUploads /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/read/:id" element={<ProtectedRoute><Reader /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/welcome" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestBook /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute adminOnly><Requests /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute adminOnly><BlogAdmin /></ProtectedRoute>} />
        <Route path="/admin/blog/new" element={<ProtectedRoute adminOnly><BlogEditor /></ProtectedRoute>} />
        <Route path="/admin/blog/:id/edit" element={<ProtectedRoute adminOnly><BlogEditor /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}