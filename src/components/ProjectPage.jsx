import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import githubAPI from '../services/githubAPI';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Badge configuration with colors and thresholds
const BADGES = [
  { threshold: 20, level: 'A', color: 'bg-purple-600', text: 'text-white' },
  { threshold: 15, level: 'B', color: 'bg-blue-600', text: 'text-white' },
  { threshold: 10, level: 'C', color: 'bg-green-600', text: 'text-white' },
  { threshold: 5, level: 'D', color: 'bg-yellow-500', text: 'text-gray-900' },
  { threshold: 0, level: 'E', color: 'bg-gray-300', text: 'text-gray-900' }
];

// Helper function to assign badges based on contribution count
const assignBadge = (prCount) => {
  const badge = BADGES.find(b => prCount > b.threshold) || BADGES[BADGES.length - 1];
  return {
    level: badge.level,
    color: badge.color,
    textColor: badge.text
  };
};

// Simple text-based icons
const TextIcons = {
  Star: '★',
  Branch: '↷',
  Warning: '⚠',
  Search: '🔍',
  ChevronLeft: '‹',
  ChevronRight: '›',
  Trophy: '🏆'
};

function ProjectPage() {
  const { owner, repo } = useParams();
  const [contributors, setContributors] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  // Fetch project details and contributors
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [projectData, contributorsData] = await Promise.all([
          githubAPI.getProject(owner, repo),
          githubAPI.getContributors(owner, repo)
        ]);

        setProjectInfo(projectData);
        
        const enhancedContributors = contributorsData.map(contributor => ({
          ...contributor,
          badge: assignBadge(contributor.contributions),
          score: calculateScore(contributor.contributions, contributor.followers)
        }));
        
        setContributors(enhancedContributors);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [owner, repo]);

  // Calculate score based on contributions and followers
  const calculateScore = (contributions, followers = 1) => {
    return Math.round((contributions * 10) + (followers * 2));
  };

  // Filter contributors based on search query
  const filteredContributors = useMemo(() => {
    return contributors.filter(user =>
      user.login.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contributors, searchQuery]);

  // Get top 3 performers
  const topPerformers = useMemo(() => {
    return [...filteredContributors]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [filteredContributors]);

  // Pagination logic
  const totalPages = Math.ceil(filteredContributors.length / itemsPerPage);
  const currentPageContributors = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredContributors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContributors, page, itemsPerPage]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) setPage(p => p + 1);
  }, [page, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  if (error) {
    return (
      <div className="my-8 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center text-red-600 mb-2">
          <span className="mr-2">{TextIcons.Warning}</span>
          <h2 className="text-xl font-bold">Error Loading Project</h2>
        </div>
        <p className="text-red-800">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !projectInfo) {
    return (
      <div className="my-8 p-4">
        <Skeleton height={30} width={200} className="mb-6" />
        <Skeleton count={3} className="mb-4" />
        
        <h3 className="text-lg font-semibold mb-2">
          <Skeleton width={150} />
        </h3>
        <div className="flex gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton circle width={96} height={96} />
              <Skeleton width={80} className="mt-2" />
              <Skeleton width={60} className="mt-1" />
              <Skeleton width={40} className="mt-1" />
            </div>
          ))}
        </div>
        
        <Skeleton height={40} className="mb-4" />
        
        <h3 className="text-lg font-semibold mb-2">
          <Skeleton width={150} />
        </h3>
        <Skeleton height={200} className="mb-4" />
      </div>
    );
  }

  return (
    <div className="my-8 p-4 max-w-6xl mx-auto">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-900">{projectInfo.name}</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {projectInfo.private ? 'Private' : 'Public'}
            </span>
          </div>
          
          <p className="text-lg text-gray-700 mb-4">{projectInfo.description || 'No description provided.'}</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <span className="mr-1 text-yellow-500">{TextIcons.Star}</span>
              <span>{projectInfo.stargazers_count.toLocaleString()} stars</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="mr-1 text-blue-500">{TextIcons.Branch}</span>
              <span>{projectInfo.forks_count.toLocaleString()} forks</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="mr-1 text-red-500">{TextIcons.Warning}</span>
              <span>{projectInfo.open_issues_count.toLocaleString()} open issues</span>
            </div>
          </div>
          
          {projectInfo.homepage && (
            <a 
              href={projectInfo.homepage} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              Visit Project Website
            </a>
          )}
        </div>
        
        {/* Project Rating Card */}
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-center">Project Rating</h3>
          <div className="flex justify-center items-center mb-2">
            <div className="text-4xl font-bold text-yellow-500">
              {Math.min(5, (projectInfo.stargazers_count * 0.05).toFixed(1))}
            </div>
            <span className="text-gray-500 ml-1">/5</span>
          </div>
          <div className="flex justify-center">
            {'★'.repeat(5).split('').map((star, i) => (
              <span key={i} className={`text-${i < 3 ? 'yellow' : 'gray'}-400`}>{star}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-yellow-500">{TextIcons.Trophy}</span> Top Contributors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformers.length > 0 ? topPerformers.map((user, index) => (
            <div 
              key={user.id} 
              className={`bg-white p-4 rounded-lg shadow border ${
                index === 0 ? 'border-yellow-300' : 
                index === 1 ? 'border-gray-300' : 
                'border-amber-700'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <img 
                    src={user.avatar_url} 
                    alt={user.login} 
                    className="w-20 h-20 rounded-full border-2 border-white shadow"
                  />
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-400' : 
                    index === 1 ? 'bg-gray-300' : 
                    'bg-amber-600 text-white'
                  }`}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                </div>
                
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {user.login}
                </a>
                
                <div className="mt-2 text-sm">
                  <span className="font-medium">Score: </span>
                  <span className="font-bold">{user.score}</span>
                </div>
                
                <div className="mt-1 text-sm">
                  <span className="font-medium">PRs: </span>
                  <span>{user.contributions}</span>
                </div>
                
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    user.badge.color
                  } ${user.badge.textColor}`}>
                    {user.badge.level}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-4 text-gray-500">
              No top performers yet. Be the first to contribute!
            </div>
          )}
        </div>
      </div>

      {/* Contributors Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Contributors ({filteredContributors.length})
          </h3>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span>{TextIcons.Search}</span>
            </div>
            <input
              type="text"
              placeholder="Search contributors..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageContributors.length > 0 ? (
                  currentPageContributors.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(page - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              src={user.avatar_url}
                              alt={user.login}
                              className="h-10 w-10 rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <a
                              href={`https://github.com/${user.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {user.login}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.contributions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {user.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.badge.color
                        } ${user.badge.textColor}`}>
                          {user.badge.level}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No contributors found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredContributors.length > itemsPerPage && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * itemsPerPage, filteredContributors.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredContributors.length}</span> contributors
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      {TextIcons.ChevronLeft}
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      {TextIcons.ChevronRight}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;