import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import githubAPI from '../services/githubAPI';

function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await githubAPI.getInitialProjects();
      setProjects(response);
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="my-8 p-4 bg-gray-100 rounded">
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <div className="grid gap-4">
        {projects.map(project => (
          <Link
            key={project.id}
            to={`/project/${project.owner.login}/${project.name}`}
            className="cursor-pointer p-4 bg-white rounded shadow block"
          >
            <h3 className="text-lg font-bold">{project.name}</h3>
            <p>{project.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Projects;
