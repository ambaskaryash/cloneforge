import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store for real-time progress tracking
export const progressStore = new Map<string, {
  status: string;
  step: string;
  progress: number;
  message: string;
  details?: any;
  timestamp: Date;
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Check if user owns this project
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        user: { clerkId: userId }
      },
      include: {
        generatedVersions: {
          select: {
            id: true,
            framework: true,
            status: true,
            generatedAt: true,
            files: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get real-time progress if available
    const realTimeProgress = progressStore.get(projectId);

    return NextResponse.json({
      project: {
        id: project.id,
        status: project.status,
        name: project.name,
        originalUrl: project.originalUrl,
        detectedTechnology: project.detectedTechnology,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        screenshots: project.screenshots,
        generatedVersions: project.generatedVersions
      },
      progress: realTimeProgress || {
        status: project.status,
        step: getStepFromStatus(project.status),
        progress: getProgressFromStatus(project.status),
        message: getMessageFromStatus(project.status),
        timestamp: project.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching project progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getStepFromStatus(status: string): string {
  switch (status) {
    case 'PENDING': return 'Initializing';
    case 'ANALYZING': return 'Analyzing Website';
    case 'ANALYZED': return 'Analysis Complete';
    case 'GENERATING': return 'Generating Code';
    case 'COMPLETED': return 'Completed';
    case 'FAILED': return 'Failed';
    default: return 'Unknown';
  }
}

function getProgressFromStatus(status: string): number {
  switch (status) {
    case 'PENDING': return 10;
    case 'ANALYZING': return 30;
    case 'ANALYZED': return 60;
    case 'GENERATING': return 80;
    case 'COMPLETED': return 100;
    case 'FAILED': return 0;
    default: return 0;
  }
}

function getMessageFromStatus(status: string): string {
  switch (status) {
    case 'PENDING': return 'Project created, starting analysis...';
    case 'ANALYZING': return 'Analyzing website structure and content...';
    case 'ANALYZED': return 'Analysis complete, starting code generation...';
    case 'GENERATING': return 'Generating code for multiple frameworks...';
    case 'COMPLETED': return 'Website successfully cloned! Ready for download.';
    case 'FAILED': return 'An error occurred during the cloning process.';
    default: return 'Processing...';
  }
}

// Helper function to update progress (used by background processes)
export function updateProgress(projectId: string, update: {
  status?: string;
  step?: string;
  progress?: number;
  message?: string;
  details?: any;
}) {
  const current = progressStore.get(projectId) || {
    status: 'PENDING',
    step: 'Initializing',
    progress: 0,
    message: 'Starting...',
    timestamp: new Date()
  };

  const updated = {
    ...current,
    ...update,
    timestamp: new Date()
  };

  progressStore.set(projectId, updated);
  
  // Clean up old entries (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [id, data] of progressStore.entries()) {
    if (data.timestamp < oneHourAgo) {
      progressStore.delete(id);
    }
  }

  return updated;
}