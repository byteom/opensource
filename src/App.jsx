import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AboutUs from './components/AboutUs';
import MainLeaderboard from './components/MainLeaderboard';
import ProjectsPage from './components/ProjectsPage'; // Projects Page
import ProjectPage from './components/ProjectPage'; // Detailed Project Page

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<>
            <AboutUs />
            <MainLeaderboard /> {/* Home page displays the leaderboard */}
          </>} />
          <Route path="/projects" element={<ProjectsPage />} /> {/* Projects page */}
          <Route path="/project/:owner/:repo" element={<ProjectPage />} /> {/* Project Details Page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
