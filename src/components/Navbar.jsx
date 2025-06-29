import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaProjectDiagram, FaTrophy } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinkStyles = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 transition-colors duration-200 ${
      isActive ? 'text-yellow-400' : 'text-white hover:text-yellow-300'
    }`;

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        <span className="text-xl font-bold">GitHub Leaderboard</span>

        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle Menu">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className={`md:flex gap-4 ${isOpen ? 'block' : 'hidden'} md:block`}>
          <NavLink to="/" className={navLinkStyles}>
            <FaHome /> Home
          </NavLink>
          <NavLink to="/projects" className={navLinkStyles}>
            <FaProjectDiagram /> Projects
          </NavLink>
          <NavLink to="/leaderboard" className={navLinkStyles}>
            <FaTrophy /> Leaderboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
