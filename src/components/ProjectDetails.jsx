import React, { useState, useEffect } from 'react';
import githubAPI from '../services/githubAPI';

// Helper function to assign color-coded badges
const getBadge = (pr_count) => {
  if (pr_count > 20) return { label: 'A', color: 'bg-green-500' };
  if (pr_count > 15) return { label: 'B', color: 'bg-blue-500' };
  if (pr_count > 10) return { label: 'C', color: 'bg-yellow-500' };
  if (pr_count > 5) return { label: 'D', color: 'bg-orange-500' };
  return { label: 'E', color: 'bg-red-500' };
};

function ProjectDetails({ project }) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await githubAPI.getContributors(project.owner.login, project.name);
        const enriched = response.map(contributor => {
          const badge = getBadge(contributor.contributions);
          return {
            ...contributor,
            badgeLabel: badge.label,
            badgeColor: badge.color,
          };
        });
        setContributors(enriched);
      } catch (err) {
        setError('⚠️ Unable to load contributors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [project]);

  return (
    <section className="my-4 p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-bold mb-2">{project.name} Contributors</h3>
      <p className="text-gray-600 mb-4">{project.description}</p>

      {loading && <p className="animate-pulse text-gray-500">Loading contributors...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-4">
        {!loading && contributors.map((contributor) => (
          <li
            key={contributor.id}
            className="flex items-center gap-4 p-3 border rounded hover:shadow transition"
          >
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login}'s avatar`}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <a
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {contributor.login}
              </a>
              <p className="text-sm text-gray-600">
                Contributions: {contributor.contributions}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-bold text-white rounded-full ${contributor.badgeColor}`}
            >
              Badge {contributor.badgeLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProjectDetails;
