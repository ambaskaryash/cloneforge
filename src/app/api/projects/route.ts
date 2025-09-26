import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { websiteAnalyzer } from '@/lib/website-analyzer';
import { codeGenerator } from '@/lib/code-generator';

const prisma = new PrismaClient();
import type { Framework } from '@prisma/client';

// GET /api/projects - Fetch user's projects
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user record
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ projects: [] });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        generatedVersions: {
          select: {
            framework: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create new project and start analysis
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Get or create user record
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      // Create user record from Clerk data
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com', // This would come from Clerk in a real app
        }
      });
    }

    // Check usage limits based on subscription
    if (user.subscriptionPlan === 'FREE' && user.monthlyClones >= 5) {
      return NextResponse.json({ 
        error: 'Monthly clone limit reached. Please upgrade your plan.' 
      }, { status: 403 });
    }

    if (user.subscriptionPlan === 'PRO' && user.monthlyClones >= 100) {
      return NextResponse.json({ 
        error: 'Monthly clone limit reached. Please upgrade to Premium.' 
      }, { status: 403 });
    }

    // Create project record
    const project = await prisma.project.create({
      data: {
        name: `Website Clone - ${new Date().toLocaleDateString()}`,
        originalUrl: url,
        userId: user.id,
        status: 'PENDING'
      }
    });

    // Start analysis in background
    setTimeout(() => {
      analyzeWebsiteBackground(project.id, url);
    }, 1000); // Small delay to return response first

    // Update user's clone count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyClones: { increment: 1 }
      }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Background function to analyze website (in production, this would be a queue job)
async function analyzeWebsiteBackground(projectId: string, url: string) {
  const { updateProgress } = await import('./[id]/progress/route');
  
  try {
    // Update status to analyzing
    updateProgress(projectId, {
      status: 'ANALYZING',
      step: 'Starting Analysis',
      progress: 15,
      message: 'Initializing website analysis...'
    });
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'ANALYZING' }
    });

    // Analyze the website
    updateProgress(projectId, {
      step: 'Analyzing Website Structure',
      progress: 25,
      message: 'Extracting HTML, CSS, and JavaScript...'
    });
    
    const analysis = await websiteAnalyzer.analyzeWebsite(url);
    
    updateProgress(projectId, {
      step: 'Analysis Complete',
      progress: 50,
      message: 'Website analysis completed successfully!'
    });
    
    // Update project with analysis results
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'ANALYZED',
        detectedTechnology: analysis.detectedTechnology.framework,
        extractedHtml: analysis.html.substring(0, 50000), // Limit size for database
        extractedCss: analysis.css.substring(0, 50000),
        extractedJs: analysis.javascript.substring(0, 50000),
        screenshots: analysis.screenshots,
      }
    });

    // Generate code for common frameworks
    const frameworks: Framework[] = ['HTML_CSS_JS', 'NEXTJS', 'REACT'];
    
    updateProgress(projectId, {
      status: 'GENERATING',
      step: 'Starting Code Generation',
      progress: 60,
      message: `Generating code for ${frameworks.length} frameworks...`
    });
    
    for (let i = 0; i < frameworks.length; i++) {
      const framework = frameworks[i];
      try {
        // Update status to generating
        await prisma.project.update({
          where: { id: projectId },
          data: { status: 'GENERATING' }
        });
        
        updateProgress(projectId, {
          step: `Generating ${framework} Code`,
          progress: 60 + (i + 1) * 10,
          message: `Creating ${framework} version of the website...`
        });

        const result = await codeGenerator.generateCode(analysis, framework);
        
        // Store generated version
        await prisma.generatedVersion.create({
          data: {
            projectId,
            framework,
            status: 'COMPLETED',
            files: result.files,
            buildSize: JSON.stringify(result.files).length,
          }
        });
      } catch (error) {
        console.error(`Error generating ${framework} code:`, error);
        
        // Store failed version
        await prisma.generatedVersion.create({
          data: {
            projectId,
            framework,
            status: 'FAILED',
            files: [],
          }
        });
      }
    }

    // Final update to completed status
    updateProgress(projectId, {
      status: 'COMPLETED',
      step: 'All Done!',
      progress: 100,
      message: 'Website successfully cloned and ready for download!'
    });
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' }
    });

  } catch (error) {
    console.error('Error in background analysis:', error);
    
    // Update project to failed status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' }
    });
  } finally {
    // Close browser if needed
    await websiteAnalyzer.closeBrowser();
  }
}