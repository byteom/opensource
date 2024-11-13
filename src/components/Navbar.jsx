import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <span className="text-lg font-bold">GitHub Leaderboard</span>
        <div>
          <Link to="/" className="px-4">Home</Link>  {/* Link to the Home Page */}
          <Link to="/projects" className="px-4">Projects</Link>
          <Link to="/leaderboard" className="px-4">GitHub Leaderboard</Link>  {/* Link to GitHub Leaderboard */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
