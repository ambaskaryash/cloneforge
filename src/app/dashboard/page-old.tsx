'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { PlusIcon, GlobeAltIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  originalUrl: string;
  status: 'PENDING' | 'ANALYZING' | 'ANALYZED' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  detectedTechnology?: string;
  generatedVersions?: {
    framework: string;
    status: string;
  }[];
}

export default function DashboardPage() {
  const { user } = useUser();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setUrl('');
        fetchProjects(); // Refresh the projects list
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className=\"h-5 w-5 text-green-500\" />;
      case 'FAILED':
        return <ExclamationTriangleIcon className=\"h-5 w-5 text-red-500\" />;
      case 'ANALYZING':
      case 'GENERATING':
        return (
          <div className=\"h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent\" />
        );
      default:
        return <ClockIcon className=\"h-5 w-5 text-yellow-500\" />;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ANALYZING':
        return 'Analyzing...';
      case 'ANALYZED':
        return 'Analysis Complete';
      case 'GENERATING':
        return 'Generating Code...';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Header */}
        <div className=\"mb-8\">
          <h1 className=\"text-3xl font-bold text-gray-900\">Welcome back, {user?.firstName}!</h1>
          <p className=\"text-gray-600 mt-2\">Clone any website and convert it to your preferred framework</p>
        </div>

        {/* URL Input Form */}
        <div className=\"bg-white rounded-xl shadow-sm border p-6 mb-8\">
          <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">Clone a New Website</h2>
          <form onSubmit={handleSubmit} className=\"space-y-4\">
            <div>
              <label htmlFor=\"url\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Website URL
              </label>
              <div className=\"relative\">
                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                  <GlobeAltIcon className=\"h-5 w-5 text-gray-400\" />
                </div>
                <input
                  type=\"url\"
                  id=\"url\"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder=\"https://example.com\"
                  className=\"block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className=\"text-red-600 text-sm\">{error}</div>
            )}
            
            <button
              type=\"submit\"
              disabled={isLoading}
              className=\"w-full sm:w-auto inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              {isLoading ? (
                <>
                  <div className=\"animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2\" />
                  Analyzing Website...
                </>
              ) : (
                <>
                  <PlusIcon className=\"h-5 w-5 mr-2\" />
                  Clone Website
                </>
              )}
            </button>
          </form>
        </div>

        {/* Projects List */}
        <div className=\"bg-white rounded-xl shadow-sm border\">
          <div className=\"px-6 py-4 border-b\">
            <h2 className=\"text-xl font-semibold text-gray-900\">Your Projects</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className=\"text-center py-12\">
              <GlobeAltIcon className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
              <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No projects yet</h3>
              <p className=\"text-gray-600\">Clone your first website to get started!</p>
            </div>
          ) : (
            <div className=\"divide-y divide-gray-200\">
              {projects.map((project) => (
                <div key={project.id} className=\"px-6 py-4 hover:bg-gray-50 transition-colors\">
                  <div className=\"flex items-center justify-between\">
                    <div className=\"flex-1\">
                      <div className=\"flex items-center space-x-3\">
                        <div className=\"flex-shrink-0\">
                          {getStatusIcon(project.status)}
                        </div>
                        <div className=\"flex-1 min-w-0\">
                          <h3 className=\"text-lg font-medium text-gray-900 truncate\">
                            {project.name || 'Untitled Project'}
                          </h3>
                          <p className=\"text-sm text-gray-600 truncate\">{project.originalUrl}</p>
                          <div className=\"flex items-center space-x-4 mt-2\">
                            <span className=\"text-xs text-gray-500\">
                              {getStatusText(project.status)}
                            </span>
                            {project.detectedTechnology && (
                              <span className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800\">
                                {project.detectedTechnology}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=\"flex-shrink-0 text-right\">
                      <p className=\"text-sm text-gray-500\">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                      {project.status === 'COMPLETED' && (
                        <button className=\"mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors\">
                          View Project
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {project.generatedVersions && project.generatedVersions.length > 0 && (
                    <div className=\"mt-3 flex flex-wrap gap-2\">
                      {project.generatedVersions.map((version, index) => (
                        <span
                          key={index}
                          className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800\"
                        >
                          {version.framework} - {version.status}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}