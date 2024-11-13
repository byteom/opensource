import axios from 'axios';

// GitHub API base URL
const GITHUB_API_URL = 'https://api.github.com';

// Set authorization header using the GitHub token stored in environment variables
const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
};

// Array of initial repositories for which we want to fetch data
const initialRepositories = [
  { owner: 'byteom', repo: 'quiz-lab' },
  { owner: 'byteom', repo: 'my-portfolio' },
  {owner: 'vaishnavirajj', repo: 'Task-Management-Board'},
    {owner: 'ankit071105', repo: 'Ticket-Booking'},
];

// Fetch initial projects (repositories) details
const getInitialProjects = async () => {
  try {
    const projectData = await Promise.all(
      initialRepositories.map(async (repo) => {
        // Fetch the repository details (name, description, etc.)
        const response = await axios.get(`${GITHUB_API_URL}/repos/${repo.owner}/${repo.repo}`, { headers });
        return response.data;
      })
    );
    return projectData;
  } catch (error) {
    console.error("Error fetching initial projects:", error.message);
    return [];
  }
};

// Fetch a specific project's details by owner and repo
const getProject = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}`, { headers });
    return response.data; // Return the repository details (name, description, etc.)
  } catch (error) {
    console.error(`Error fetching project details for ${repo}:`, error.message);
    return null;
  }
};

// Fetch contributors for a specific repository
const getContributors = async (owner, repo) => {
  try {
    // Fetch contributors for the specified project
    const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/contributors`, { headers });
    return response.data; // Return the contributors data (login, contributions, etc.)
  } catch (error) {
    console.error(`Error fetching contributors for ${repo}:`, error.message);
    return [];
  }
};

// Get detailed information for contributors and their PR count
const getContributorDetails = async (owner, repo) => {
  try {
    // Fetch the list of contributors for a project
    const contributors = await getContributors(owner, repo);
    
    // Map through the contributors to add details like rank, badges, and scores
    const contributorDetails = contributors.map((contributor, index) => ({
      id: contributor.id,
      login: contributor.login,
      avatar_url: contributor.avatar_url,
      contributions: contributor.contributions,
      rank: index + 1,
      score: contributor.contributions * 10,  // Example score calculation
      badge: assignBadge(contributor.contributions),
    }));

    return contributorDetails;
  } catch (error) {
    console.error(`Error fetching detailed contributor info for ${repo}:`, error.message);
    return [];
  }
};

// Helper function to assign badges based on contributions (A to E)
const assignBadge = (pr_count) => {
  if (pr_count > 20) return 'A';
  if (pr_count > 15) return 'B';
  if (pr_count > 10) return 'C';
  if (pr_count > 5) return 'D';
  return 'E';
};

// Fetch and return the complete leaderboard (from multiple projects)
const getLeaderboard = async () => {
  try {
    const projects = await getInitialProjects(); // Fetch all projects
    const leaderboard = await Promise.all(
      projects.map(async (project) => {
        // For each project, fetch the contributor details
        const contributors = await getContributorDetails(project.owner.login, project.name);
        return contributors;
      })
    );

    // Flatten all the contributor data into one leaderboard
    const consolidatedLeaderboard = leaderboard.flat();
    return consolidatedLeaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    return [];
  }
};

export default {
  getInitialProjects,
  getProject,
  getContributors,
  getContributorDetails,
  getLeaderboard,
};
