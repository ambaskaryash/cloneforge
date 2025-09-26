'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  ArrowLeftIcon, 
  CloudArrowDownIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  originalUrl: string;
  status: string;
  detectedTechnology?: string;
  createdAt: string;
  updatedAt: string;
  screenshots?: string[];
  generatedVersions: GeneratedVersion[];
}

interface GeneratedVersion {
  id: string;
  framework: string;
  status: string;
  generatedAt: string;
  files: any[];
}

interface Progress {
  status: string;
  step: string;
  progress: number;
  message: string;
  timestamp: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingFramework, setDownloadingFramework] = useState<string | null>(null);

  const projectId = params.id as string;

  useEffect(() => {
    if (user && projectId) {
      fetchProjectData();
      
      // Set up polling for progress updates if project is not completed
      const interval = setInterval(() => {
        fetchProjectData();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [user, projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setProgress(data.progress);
        
        // Stop polling if completed or failed
        if (data.project.status === 'COMPLETED' || data.project.status === 'FAILED') {
          // Clear any existing intervals
        }
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (framework?: string) => {
    if (!project || project.status !== 'COMPLETED') return;

    try {
      setDownloadingFramework(framework || 'all');
      
      const params = new URLSearchParams();
      if (framework) {
        params.set('framework', framework);
      }
      
      const response = await fetch(`/api/projects/${project.id}/download?${params}`);
      
      if (response.ok) {
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'download.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download project');
    } finally {
      setDownloadingFramework(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'FAILED':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'ANALYZING':
      case 'GENERATING':
        return <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getFrameworkIcon = (framework: string) => {
    return <CodeBracketIcon className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested project could not be found.'}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.originalUrl}</p>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusIcon(project.status)}
              <span className="text-lg font-medium text-gray-900">
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cloning Progress</h2>
              
              {progress && (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{progress.step}</span>
                      <span className="text-sm text-gray-500">{progress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          progress.status === 'COMPLETED' ? 'bg-green-500' :
                          progress.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Progress Message */}
                  <div className="flex items-start space-x-3">
                    {project.status === 'COMPLETED' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : project.status === 'FAILED' ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : (
                      <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm text-gray-900">{progress.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(progress.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Screenshots */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Website Preview</h2>
                <div className="grid grid-cols-1 gap-4">
                  {project.screenshots.map((screenshot, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img 
                        src={screenshot} 
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Versions */}
            {project.generatedVersions && project.generatedVersions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Code</h2>
                <div className="space-y-4">
                  {project.generatedVersions.map((version) => (
                    <div 
                      key={version.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {getFrameworkIcon(version.framework)}
                        <div>
                          <h3 className="font-medium text-gray-900">{version.framework}</h3>
                          <p className="text-sm text-gray-500">
                            {version.status} • {(version.files || []).length} files
                          </p>
                        </div>
                      </div>
                      
                      {version.status === 'COMPLETED' && project.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(version.framework)}
                          disabled={downloadingFramework === version.framework}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {downloadingFramework === version.framework ? (
                            <>
                              <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <CloudArrowDownIcon className="h-4 w-4 mr-1" />
                              Download
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    {getStatusIcon(project.status)}
                    <span className="ml-2">{project.status}</span>
                  </p>
                </div>
                
                {project.detectedTechnology && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Detected Technology</label>
                    <p className="text-sm text-gray-900 mt-1">{project.detectedTechnology}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <a
                    href={project.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Original Website
                  </a>
                  
                  {project.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleDownload()}
                      disabled={downloadingFramework === 'all'}
                      className="inline-flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50"
                    >
                      {downloadingFramework === 'all' ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                          Download All Frameworks
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}