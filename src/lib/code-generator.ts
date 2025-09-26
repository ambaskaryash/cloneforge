import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WebsiteAnalysis } from './website-analyzer';
import type { Framework } from '@prisma/client';

interface GeneratedFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

interface CodeGenerationResult {
  files: GeneratedFile[];
  instructions: string;
  dependencies: string[];
  buildCommands: string[];
}

export class CodeGenerator {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // Using Gemini 1.5 Flash for speed and cost-effectiveness
    // Switch to 'gemini-1.5-pro' for even better quality if needed
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      }
    });
  }

  async generateCode(
    analysis: WebsiteAnalysis,
    targetFramework: Framework
  ): Promise<CodeGenerationResult> {
    switch (targetFramework) {
      case 'NEXTJS':
        return this.generateNextJS(analysis);
      case 'WORDPRESS':
        return this.generateWordPress(analysis);
      case 'LARAVEL':
        return this.generateLaravel(analysis);
      case 'PHP':
        return this.generatePHP(analysis);
      case 'HTML_CSS_JS':
        return this.generateStaticHTML(analysis);
      case 'REACT':
        return this.generateReact(analysis);
      case 'VUE':
        return this.generateVue(analysis);
      default:
        throw new Error(`Unsupported framework: ${targetFramework}`);
    }
  }

  private async generateNextJS(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    const systemPrompt = 'You are an expert web developer who specializes in converting websites to modern frameworks. Generate complete, production-ready code with proper file structure and content.';
    
    const prompt = `
Analyze the following website and generate a complete Next.js 14 application that replicates its design and functionality.

Website URL: ${analysis.url}
Title: ${analysis.title}
Description: ${analysis.description}

HTML Structure:
${analysis.html}

CSS Styles:
${analysis.css}

JavaScript:
${analysis.javascript}

Detected Technology: ${analysis.detectedTechnology.framework}
Libraries: ${analysis.metadata.libraries.join(', ')}
Meta Tags: ${JSON.stringify(analysis.metadata.metaTags, null, 2)}

Generate a modern Next.js 14 application with:
1. App Router structure
2. TypeScript support
3. Tailwind CSS for styling
4. Responsive design matching the original
5. SEO optimization
6. Modern React patterns
7. Component-based architecture

Provide the complete file structure with actual code content for each file. Format each file as:
\`\`\`filename.ext
[file content]
\`\`\`
`;

    const result = await this.model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = result.response.text();

    return this.parseAIResponse(response || '', 'NEXTJS');
  }

  private async generateReact(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    const systemPrompt = 'You are an expert React developer. Generate clean, modern React code with proper component structure.';
    
    const prompt = `
Create a React application that replicates the following website:

Website URL: ${analysis.url}
Title: ${analysis.title}

HTML Structure:
${analysis.html}

CSS Styles:
${analysis.css}

JavaScript:
${analysis.javascript}

Generate a complete React application with:
1. Modern functional components with hooks
2. CSS modules or styled-components
3. Responsive design matching the original
4. Component-based architecture
5. Proper file structure

Provide the complete file structure and code. Format each file as:
\`\`\`filename.ext
[file content]
\`\`\`
`;

    const result = await this.model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = result.response.text();

    return this.parseAIResponse(response || '', 'REACT');
  }

  private async generateVue(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    const systemPrompt = 'You are an expert Vue.js developer. Generate modern Vue.js 3 code with Composition API and best practices.';
    
    const prompt = `
Create a Vue.js 3 application that replicates the following website:

Website URL: ${analysis.url}
Title: ${analysis.title}

HTML Structure:
${analysis.html}

CSS Styles:
${analysis.css}

JavaScript:
${analysis.javascript}

Generate a Vue.js 3 application with:
1. Composition API
2. Single File Components
3. Scoped styles matching the original design
4. Responsive design
5. Modern Vue patterns

Provide the complete file structure and code. Format each file as:
\`\`\`filename.ext
[file content]
\`\`\`
`;

    const result = await this.model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = result.response.text();

    return this.parseAIResponse(response || '', 'VUE');
  }

  private async generateWordPress(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    const systemPrompt = 'You are an expert WordPress developer. Generate clean, standards-compliant WordPress theme code following WordPress best practices.';
    
    const prompt = `
Create a WordPress theme that replicates the following website:

Website URL: ${analysis.url}
Title: ${analysis.title}

HTML Structure:
${analysis.html}

CSS Styles:
${analysis.css}

JavaScript:
${analysis.javascript}

Generate a complete WordPress theme with:
1. PHP template files (index.php, header.php, footer.php, etc.)
2. functions.php with theme setup and enqueue scripts
3. style.css with theme styles matching the original
4. Responsive design
5. WordPress best practices and hooks

Provide the complete theme file structure. Format each file as:
\`\`\`filename.ext
[file content]
\`\`\`
`;

    const result = await this.model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = result.response.text();

    return this.parseAIResponse(response || '', 'WORDPRESS');
  }

  private async generateLaravel(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    const systemPrompt = 'You are an expert Laravel developer. Generate clean Laravel application code following MVC patterns and Laravel best practices.';
    
    const prompt = `
Create a Laravel application that replicates the following website:

Website URL: ${analysis.url}
Title: ${analysis.title}

HTML Structure:
${analysis.html}

CSS Styles:
${analysis.css}

JavaScript:
${analysis.javascript}

Generate a Laravel application with:
1. Blade templates matching the original design
2. Controllers and routes
3. CSS/JS assets organized properly
4. Responsive design
5. Laravel best practices

Provide the key files and structure. Format each file as:
\`\`\`filename.ext
[file content]
\`\`\`
`;

    const result = await this.model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = result.response.text();

    return this.parseAIResponse(response || '', 'LARAVEL');
  }

  private async generatePHP(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    const systemPrompt = 'You are an expert PHP developer. Generate clean, modern PHP application code with proper separation of concerns.';
    
    const prompt = `
Create a PHP application that replicates the following website:

Website URL: ${analysis.url}
Title: ${analysis.title}

HTML Structure:
${analysis.html}

CSS Styles:
${analysis.css}

JavaScript:
${analysis.javascript}

Generate a PHP application with:
1. Clean PHP code with proper structure
2. Separated HTML/CSS/JS files
3. Basic routing or structure
4. Responsive design matching the original
5. Modern PHP practices

Provide the complete file structure. Format each file as:
\`\`\`filename.ext
[file content]
\`\`\`
`;

    const result = await this.model.generateContent(`${systemPrompt}\n\n${prompt}`);
    const response = result.response.text();

    return this.parseAIResponse(response || '', 'PHP');
  }

  private async generateStaticHTML(analysis: WebsiteAnalysis): Promise<CodeGenerationResult> {
    // For static HTML, we can directly use the analyzed content with improvements
    const files: GeneratedFile[] = [
      {
        path: 'index.html',
        content: this.cleanupHTML(analysis.html),
        type: 'file',
      },
      {
        path: 'style.css',
        content: this.cleanupCSS(analysis.css),
        type: 'file',
      },
      {
        path: 'script.js',
        content: this.cleanupJavaScript(analysis.javascript),
        type: 'file',
      },
    ];

    return {
      files,
      instructions: 'Static HTML/CSS/JS website ready to deploy. Open index.html in a web browser.',
      dependencies: [],
      buildCommands: [],
    };
  }

  private parseAIResponse(content: string, framework: string): CodeGenerationResult {
    // Enhanced parser for better file extraction from AI responses
    const files: GeneratedFile[] = [];
    const dependencies: string[] = [];
    const buildCommands: string[] = [];
    
    // Extract file blocks from AI response with improved regex
    const fileMatches = content.match(/```[\w\/\.\-_]+\n[\s\S]*?```/g) || [];
    
    fileMatches.forEach((match) => {
      const lines = match.split('\n');
      const firstLine = lines[0];
      const fileName = firstLine.replace('```', '').trim();
      const fileContent = lines.slice(1, -1).join('\n');
      
      if (fileName && fileContent.trim()) {
        files.push({
          path: fileName,
          content: fileContent,
          type: 'file',
        });
      }
    });
    
    // Extract dependencies and build commands from the AI response
    if (framework === 'NEXTJS') {
      dependencies.push('next', 'react', 'react-dom', 'typescript', '@types/react', '@types/node', 'tailwindcss');
      buildCommands.push('npm install', 'npm run dev');
    } else if (framework === 'REACT') {
      dependencies.push('react', 'react-dom', 'react-scripts', '@types/react', '@types/react-dom');
      buildCommands.push('npm install', 'npm start');
    } else if (framework === 'VUE') {
      dependencies.push('vue', '@vitejs/plugin-vue', 'vite', 'typescript');
      buildCommands.push('npm install', 'npm run dev');
    } else if (framework === 'WORDPRESS') {
      buildCommands.push('Upload theme to wp-content/themes/', 'Activate in WordPress admin');
    } else if (framework === 'LARAVEL') {
      buildCommands.push('composer install', 'php artisan serve');
    } else if (framework === 'PHP') {
      buildCommands.push('Start local server: php -S localhost:8000');
    }
    
    return {
      files,
      instructions: `Generated ${framework} application with full website content and styling. ${framework === 'HTML_CSS_JS' ? 'No build process required.' : 'Follow the build commands to run the project.'}`,
      dependencies,
      buildCommands,
    };
  }

  private cleanupHTML(html: string): string {
    // Remove scripts that might cause issues, clean up the HTML
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove existing scripts
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private cleanupCSS(css: string): string {
    // Clean up CSS, remove comments, normalize
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private cleanupJavaScript(js: string): string {
    // Clean up JavaScript, remove problematic code
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

export const codeGenerator = new CodeGenerator();