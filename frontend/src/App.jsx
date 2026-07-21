import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import PostPage from './pages/PostPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminUpload from './pages/AdminUpload.jsx';
import AdminEdit from './pages/AdminEdit.jsx';

function App() {
  return (
    <div>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/admin/login" element={<AuthPage />} />
          <Route path="/admin/new" element={<AdminUpload />} />
          <Route path="/admin/edit/:id" element={<AdminEdit />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
