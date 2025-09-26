import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import JSZip from 'jszip';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
    framework: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: PageProps
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, framework } = params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get project and generated version
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        generatedVersions: {
          where: {
            framework: framework.toUpperCase() as 'NEXTJS' | 'REACT' | 'HTML_CSS_JS' | 'VUE'
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const generatedVersion = project.generatedVersions[0];
    if (!generatedVersion || generatedVersion.status !== 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Generated version not available' 
      }, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();
    const files = generatedVersion.files as { path: string; content: string; type: string }[];

    // Add files to ZIP
    files.forEach((file: { path: string; content: string; type: string }) => {
      if (file.type === 'file') {
        zip.file(file.path, file.content);
      }
    });

    // Add README with instructions
    const readmeContent = `
# ${project.name} - ${framework.toUpperCase()} Version

Generated from: ${project.originalUrl}
Framework: ${framework.toUpperCase()}
Generated on: ${generatedVersion.generatedAt}

## Instructions

1. Extract all files from this ZIP
2. Follow the build commands in the project files
3. Install dependencies if needed
4. Run the development server

## Support

For support, please contact our team.
    `;
    
    zip.file('README.md', readmeContent.trim());

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=\"${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${framework}.zip\"`,
        'Content-Length': zipBuffer.length.toString(),
      }
    });

  } catch (error) {
    console.error('Error downloading project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}