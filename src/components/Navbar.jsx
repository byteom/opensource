import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-lg font-bold">GitHub Leaderboard</span>
        <div className="flex space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                : 'hover:text-blue-300'
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                : 'hover:text-blue-300'
            }
          >
            Projects
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              isActive
                ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                : 'hover:text-blue-300'
            }
          >
            GitHub Leaderboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;