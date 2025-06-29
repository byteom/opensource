import React, { useEffect, useState } from 'react';
import githubAPI from '../services/githubAPI';

const assignBadge = (pr_count) => {
  if (pr_count > 20) return 'A';
  if (pr_count > 15) return 'B';
  if (pr_count > 10) return 'C';
  if (pr_count > 5) return 'D';
  return 'E';
};

const getRankEmoji = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

function MainLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
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

        const flattenedData = allContributors.flat();
        const uniqueUsers = {};

        flattenedData.forEach((user) => {
          if (!uniqueUsers[user.login]) {
            uniqueUsers[user.login] = {
              ...user,
              repo_count: new Set([user.project]),
            };
          } else {
            uniqueUsers[user.login].pr_count += user.pr_count;
            uniqueUsers[user.login].repo_count.add(user.project);
          }
        });

        const consolidatedLeaderboard = Object.values(uniqueUsers)
          .map((contributor) => ({
            ...contributor,
            score: contributor.pr_count * 10,
            repo_count: contributor.repo_count.size,
          }))
          .sort((a, b) => b.score - a.score)
          .map((user, index) => ({ ...user, rank: index + 1 }));

        setLeaderboard(consolidatedLeaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data.");
      }
    };

    fetchLeaderboard();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredLeaderboard = leaderboard.filter(user =>
    user.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topPerformers = filteredLeaderboard.slice(0, 3);

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
    <section className="my-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Main Leaderboard
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Top Performers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topPerformers.length > 0 ? topPerformers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow text-center"
            >
              <img src={user.avatar_url} alt={user.login} className="w-20 h-20 rounded-full mx-auto mb-2" />
              <p className="text-lg font-bold dark:text-white">{getRankEmoji(user.rank)} {user.login}</p>
              <p className="text-gray-600 dark:text-gray-300">Score: {user.score}</p>
              <p className="text-gray-600 dark:text-gray-300">Badge: {user.badge}</p>
              <p className="text-gray-600 dark:text-gray-300">Repos: {user.repo_count}</p>
            </div>
          )) : (
            <p className="text-gray-500 dark:text-gray-300">No top performers yet.</p>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by GitHub username"
        className="p-2 mb-4 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <table className="w-full text-left bg-white dark:bg-gray-700 rounded shadow overflow-x-auto">
        <thead className="bg-gray-200 dark:bg-gray-600">
          <tr>
            <th className="p-2">Rank</th>
            <th className="p-2">Avatar</th>
            <th className="p-2">GitHub Username</th>
            <th className="p-2">No. of PRs</th>
            <th className="p-2">Score</th>
            <th className="p-2">Repos</th>
            <th className="p-2">Badge</th>
          </tr>
        </thead>
        <tbody>
          {currentPageLeaderboard.length > 0 ? (
            currentPageLeaderboard.map((user, index) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-gray-600">
                <td className="p-2">{getRankEmoji((page - 1) * itemsPerPage + index + 1)}</td>
                <td className="p-2">
                  <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                </td>
                <td className="p-2">
                  <a
                    href={`https://github.com/${user.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-300 hover:underline"
                  >
                    {user.login}
                  </a>
                </td>
                <td className="p-2">{user.pr_count}</td>
                <td className="p-2">{user.score}</td>
                <td className="p-2">{user.repo_count}</td>
                <td className="p-2">{user.badge}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-300">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={endIndex >= filteredLeaderboard.length}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default MainLeaderboard;
