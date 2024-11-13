import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import githubAPI from '../services/githubAPI';

// Helper function to generate a random rating for each project
const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1); // Rating between 3.0 and 5.0

function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const projectData = await githubAPI.getInitialProjects();
      const projectsWithDetails = await Promise.all(
        projectData.map(async (project) => {
          const contributors = await githubAPI.getContributors(project.owner.login, project.name);
          return {
            ...project,
            techStack: ['React', 'Node.js', 'Express', 'MongoDB'], // Example tech stack
            totalPRs: contributors.length,
            rating: getRandomRating(),
          };
        })
      );
      setProjects(projectsWithDetails);
    };
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Projects</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link 
            key={project.id} 
            to={`/project/${project.owner.login}/${project.name}`} // Link to the detailed project page
            className="block p-4 bg-white rounded shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <h4 className="text-md font-semibold mt-4">Tech Stack</h4>
            <ul className="list-disc list-inside text-gray-700">
              {project.techStack.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
            <p className="mt-4">Total PRs: {project.totalPRs}</p>
            <p>Rating: {project.rating} / 5</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;
