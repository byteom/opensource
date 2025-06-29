import React, { useEffect, useState } from 'react';

// Dummy badge assignment (optional if you use badge from data)
const assignBadge = (pr_count) => {
  if (pr_count > 20) return 'A';
  if (pr_count > 15) return 'B';
  if (pr_count > 10) return 'C';
  if (pr_count > 5) return 'D';
  return 'E';
};

function MainLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // --- Dummy data for styling/testing ---
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        login: "user1",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
        pr_count: 10,
        score: 100,
        badge: "C"
      },
      {
        id: 2,
        login: "user2",
        avatar_url: "https://avatars.githubusercontent.com/u/2?v=4",
        pr_count: 15,
        score: 150,
        badge: "B"
      },
      {
        id: 3,
        login: "user3",
        avatar_url: "https://avatars.githubusercontent.com/u/3?v=4",
        pr_count: 5,
        score: 50,
        badge: "E"
      }
    ];
    setLeaderboard(dummyData);
  }, []);

  // ---  Search filter ---
  const filteredLeaderboard = leaderboard.filter(user =>
    user.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Top 3 Performers ---
  const topPerformers = [...filteredLeaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ---  Pagination logic ---
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageLeaderboard = filteredLeaderboard.slice(startIndex, endIndex);

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

      {/* Top Performers */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Top Performers</h3>
        <div className="flex gap-6 flex-wrap">
          {topPerformers.length > 0 ? (
            topPerformers.map((user, index) => (
              <div key={user.id} className="flex flex-col items-center bg-white p-4 rounded shadow">
                <img src={user.avatar_url} alt={user.login} className="w-16 h-16 rounded-full" />
                <p className="font-semibold">{index + 1}. {user.login}</p>
                <p>Score: {user.score}</p>
                <p>Badge: {user.badge}</p>
              </div>
            ))
          ) : (
            <p>No top performers yet.</p>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by GitHub username"
        className="p-2 mb-4 border rounded w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded shadow table-auto">
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
                <tr
                  key={user.id}
                  className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
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
                <td colSpan="6" className="p-4 text-center">
                  No contributors yet! <br />
                  <a href="#projects" className="text-blue-500 underline">
                    Start contributing to see your name here.
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Buttons */}
      {filteredLeaderboard.length > 0 && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`p-2 px-4 rounded border text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition ${
              page === 1
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={endIndex >= filteredLeaderboard.length}
            className={`p-2 px-4 rounded border text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition ${
              endIndex >= filteredLeaderboard.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default MainLeaderboard;