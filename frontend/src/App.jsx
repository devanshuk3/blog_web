import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import PostPage from './pages/PostPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminUpload from './pages/AdminUpload.jsx';
import AdminEdit from './pages/AdminEdit.jsx';
import Questions from './pages/Questions.jsx';
import QuestionDetail from './pages/QuestionDetail.jsx';
import Ideas from './pages/Ideas.jsx';
import IdeaDetail from './pages/IdeaDetail.jsx';

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
          <Route path="/questions" element={<Questions />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/idea/:id" element={<IdeaDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
