import React, { useState, useEffect } from 'react';
import githubAPI from '../services/githubAPI';

// Helper function to assign badges
const assignBadge = (pr_count) => {
  if (pr_count > 20) return 'A';
  if (pr_count > 15) return 'B';
  if (pr_count > 10) return 'C';
  if (pr_count > 5) return 'D';
  return 'E';
};

function ProjectDetails({ project }) {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const fetchContributors = async () => {
      const response = await githubAPI.getContributors(project.owner.login, project.name);
      setContributors(response.map(contributor => ({
        ...contributor,
        badge: assignBadge(contributor.contributions),
      })));
    };
    fetchContributors();
  }, [project]);

  return (
    <div className="my-4 p-4 bg-white rounded shadow">
      <h3 className="text-xl font-bold">{project.name} Contributors</h3>
      <p>{project.description}</p>
      <ul>
        {contributors.map((contributor) => (
          <li key={contributor.id} className="flex items-center p-2 border-b">
            <img src={contributor.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
            <div className="ml-4">
              <p className="font-semibold">{contributor.login}</p>
              <p>Contributions: {contributor.contributions}</p>
              <p>Badge: {contributor.badge}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectDetails;
