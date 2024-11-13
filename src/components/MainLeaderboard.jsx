import React, { useEffect, useState } from 'react';
import githubAPI from '../services/githubAPI';

// Helper function to assign badges based on PR count
const assignBadge = (pr_count) => {
  if (pr_count > 20) return 'A';
  if (pr_count > 15) return 'B';
  if (pr_count > 10) return 'C';
  if (pr_count > 5) return 'D';
  return 'E';
};

function MainLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Pagination state
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering users

  // Fetch the leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch projects and contributors
        const projects = await githubAPI.getInitialProjects();
        const allContributors = await Promise.all(
          projects.map(async (project) => {
            const contributors = await githubAPI.getContributors(project.owner.login, project.name);
            return contributors.map((contributor) => ({
              id: contributor.id,
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              pr_count: contributor.contributions,
              project: project.name,
              badge: assignBadge(contributor.contributions),
            }));
          })
        );

        // Flatten the contributors data and remove duplicates
        const flattenedData = allContributors.flat();
        const uniqueUsers = {};

        flattenedData.forEach((user) => {
          if (!uniqueUsers[user.login]) {
            uniqueUsers[user.login] = { ...user };
          } else {
            uniqueUsers[user.login].pr_count += user.pr_count; // Add PRs if user exists already
          }
        });

        // Convert the uniqueUsers object to an array
        const consolidatedLeaderboard = Object.values(uniqueUsers).map((contributor, index) => ({
          ...contributor,
          rank: index + 1,
          score: contributor.pr_count * 10, // Example: Score based on PR count
        }));

        setLeaderboard(consolidatedLeaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data.");
      }
    };
    fetchLeaderboard();
  }, []);

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter leaderboard data based on the search query
  const filteredLeaderboard = leaderboard.filter(user => 
    user.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top 3 performers dynamically based on search
  const topPerformers = filteredLeaderboard
    .sort((a, b) => b.score - a.score) // Sort by score in descending order
    .slice(0, 3); // Only top 3 performers

  // Pagination logic
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageLeaderboard = filteredLeaderboard.slice(startIndex, endIndex);

  // Handle pagination buttons
  const handleNextPage = () => {
    if (endIndex < filteredLeaderboard.length) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <section id="leaderboard" className="my-8 p-4 bg-gray-100 rounded">
      <h2 className="text-2xl font-bold mb-4">Main Leaderboard</h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* Top Performers Section */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Top Performers</h3>
        <div className="flex gap-6">
          {topPerformers.length > 0 ? topPerformers.map((user, index) => (
            <div key={user.id} className="flex flex-col items-center">
              <img src={user.avatar_url} alt={user.login} className="w-24 h-24 rounded-full" />
              <p>{index + 1}. {user.login}</p>
              <p>Score: {user.score}</p>
              <p>Badge: {user.badge}</p>
            </div>
          )) : (
            <p>No top performers yet.</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by GitHub username"
        className="p-2 mb-4 border rounded"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {/* Leaderboard Table */}
      <table className="w-full text-left bg-white rounded shadow">
        <thead>
          <tr>
            <th className="p-2">Rank</th>
            <th className="p-2">Avatar</th>
            <th className="p-2">GitHub Username</th>
            <th className="p-2">No. of PRs</th>
            <th className="p-2">Score</th>
            <th className="p-2">Badge</th>
          </tr>
        </thead>
        <tbody>
          {currentPageLeaderboard.length > 0 ? (
            currentPageLeaderboard.map((user, index) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{(page - 1) * itemsPerPage + index + 1}</td>
                <td className="p-2">
                  <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                </td>
                <td className="p-2">{user.login}</td>
                <td className="p-2">{user.pr_count}</td>
                <td className="p-2">{user.score}</td>
                <td className="p-2">{user.badge}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      <div className="mt-4 flex justify-between">
        <button onClick={handlePrevPage} disabled={page === 1} className="p-2 bg-gray-200 rounded">Previous</button>
        <button onClick={handleNextPage} disabled={endIndex >= filteredLeaderboard.length} className="p-2 bg-gray-200 rounded">Next</button>
      </div>
    </section>
  );
}

export default MainLeaderboard;
