import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import githubAPI from '../services/githubAPI';

// Helper function to assign badges based on contribution count
const assignBadge = (pr_count) => {
  if (pr_count > 20) return 'A';
  if (pr_count > 15) return 'B';
  if (pr_count > 10) return 'C';
  if (pr_count > 5) return 'D';
  return 'E';
};

function ProjectPage() {
  const { owner, repo } = useParams(); // Get owner and repo from URL params
  const [contributors, setContributors] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [page, setPage] = useState(1); // Pagination state
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering users

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Fetch project data from GitHub API
        const projectData = await githubAPI.getProject(owner, repo);
        setProjectInfo(projectData);

        // Fetch contributors for the project
        const contributorsData = await githubAPI.getContributors(owner, repo);
        setContributors(
          contributorsData.map((contributor) => ({
            ...contributor,
            badge: assignBadge(contributor.contributions),
          }))
        );
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [owner, repo]);

  // Filter contributors based on search query
  const filteredContributors = contributors.filter(user =>
    user.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top 3 performers based on contributions or score
  const topPerformers = filteredContributors
    .sort((a, b) => b.contributions - a.contributions) // Sort by number of PRs (desc)
    .slice(0, 3); // Only the top 3 performers

  // Pagination logic
  const itemsPerPage = 5; // Show 5 contributors per page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageContributors = filteredContributors.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (endIndex < filteredContributors.length) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="my-8 p-4 bg-gray-100 rounded">
      {/* Display project info */}
      {projectInfo ? (
        <>
          <h2 className="text-2xl font-bold mb-4">{projectInfo.name} Details</h2>
          <p className="mb-4">{projectInfo.description}</p>

          {/* Tech Stack */}
          <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
          <ul className="list-disc list-inside mb-4">
            <li>React</li>
            <li>Node.js</li>
            <li>Express</li>
            <li>MongoDB</li>
          </ul>

          {/* Project Rating */}
          <h3 className="text-lg font-semibold mb-2">Project Rating</h3>
          <p className="mb-4">Rating: {Math.random().toFixed(1)} / 5</p>

          {/* Top Performers Section */}
          <h3 className="text-lg font-semibold mb-2">Top 3 Contributors</h3>
          <div className="flex gap-6 mb-6">
            {topPerformers.length > 0 ? topPerformers.map((user, index) => (
              <div key={user.id} className="flex flex-col items-center">
                <img src={user.avatar_url} alt={user.login} className="w-24 h-24 rounded-full" />
                <p>{index + 1}. {user.login}</p>
                <p>Score: {user.contributions * 10}</p>
                <p>Badge: {user.badge}</p>
              </div>
            )) : (
              <p>No top performers yet.</p>
            )}
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by GitHub username"
            className="p-2 mb-4 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Contributors List */}
          <h3 className="text-lg font-semibold mb-2">Contributors</h3>
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
              {currentPageContributors.length > 0 ? (
                currentPageContributors.map((user, index) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">{startIndex + index + 1}</td>
                    <td className="p-2">
                      <img
                        src={user.avatar_url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    </td>
                    <td className="p-2">{user.login}</td>
                    <td className="p-2">{user.contributions}</td>
                    <td className="p-2">{user.contributions * 10}</td>
                    <td className="p-2">{user.badge}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    No contributors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="p-2 bg-gray-200 rounded"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={endIndex >= filteredContributors.length}
              className="p-2 bg-gray-200 rounded"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>Loading project details...</p>
      )}
    </div>
  );
}

export default ProjectPage;
