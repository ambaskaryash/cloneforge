import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

export interface WebsiteAnalysis {
  url: string;
  title: string;
  description?: string;
  html: string;
  css: string;
  javascript: string;
  images: string[];
  links: string[];
  detectedTechnology: TechnologyStack;
  screenshots: string[];
  metadata: {
    fonts: string[];
    colors: string[];
    frameworks: string[];
    libraries: string[];
  };
}

export interface TechnologyStack {
  framework: string;
  cms?: string;
  language: string;
  database?: string;
  server?: string;
  buildTool?: string;
}

export class WebsiteAnalyzer {
  private browser: puppeteer.Browser | null = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      console.log(`Starting analysis of ${url}...`);

      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('Page loaded, extracting content...');

      // Get page content
      const html = await page.content();
      const title = await page.title();
      
      // Get all CSS
      const css = await this.extractCSS(page);
      
      // Get all JavaScript
      const javascript = await this.extractJavaScript(page);
      
      // Take screenshot
      const screenshot = await page.screenshot({ 
        type: 'png', 
        fullPage: true,
        encoding: 'base64'
      });
      
      console.log('Content extracted, analyzing...');

      // Extract additional data using Cheerio
      const $ = cheerio.load(html);
      const analysis = this.analyzeHTML($, html);
      
      // Detect technology stack
      const technology = await this.detectTechnology(page, html);
      
      console.log('Analysis complete!');

      return {
        url,
        title,
        description: $('meta[name="description"]').attr('content'),
        html,
        css,
        javascript,
        images: analysis.images,
        links: analysis.links,
        detectedTechnology: technology,
        screenshots: [`data:image/png;base64,${screenshot}`],
        metadata: {
          fonts: analysis.fonts,
          colors: analysis.colors,
          frameworks: technology.framework ? [technology.framework] : [],
          libraries: analysis.libraries,
        },
      };
    } catch (error) {
      console.error('Error analyzing website:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async extractCSS(page: puppeteer.Page): Promise<string> {
    // Get inline styles and external stylesheets
    const css = await page.evaluate(() => {
      const styles: string[] = [];
      
      // Get inline styles
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        styles.push(style.textContent || '');
      });
      
      // Get computed styles for key elements
      const elements = document.querySelectorAll('body, header, nav, main, section, article, aside, footer, div, h1, h2, h3, h4, h5, h6, p, a, button');
      const computedStyles: { [key: string]: any } = {};
      
      elements.forEach((element, index) => {
        if (index < 100) { // Limit to avoid too much data
          const computed = window.getComputedStyle(element);
          const selector = element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ').join('.') : '') + (element.id ? '#' + element.id : '');
          computedStyles[selector] = {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            margin: computed.margin,
            padding: computed.padding,
            display: computed.display,
            position: computed.position,
          };
        }
      });
      
      return {
        inlineStyles: styles.join('\n'),
        computedStyles: JSON.stringify(computedStyles, null, 2)
      };
    });
    
    return css.inlineStyles + '\n/* Computed Styles */\n' + css.computedStyles;
  }

  private async extractJavaScript(page: puppeteer.Page): Promise<string> {
    const scripts = await page.evaluate(() => {
      const scriptElements = document.querySelectorAll('script');
      const scripts: string[] = [];
      
      scriptElements.forEach(script => {
        if (script.textContent && script.textContent.trim()) {
          scripts.push(script.textContent);
        }
      });
      
      return scripts;
    });
    
    return scripts.join('\n\n');
  }

  private analyzeHTML($: cheerio.CheerioAPI, html: string) {
    const images: string[] = [];
    const links: string[] = [];
    const fonts: string[] = [];
    const colors: string[] = [];
    const libraries: string[] = [];
    
    // Extract images
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src) images.push(src);
    });
    
    // Extract links
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) links.push(href);
    });
    
    // Extract font families from link tags
    $('link[href*="fonts.googleapis.com"], link[href*="fonts.google.com"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const match = href.match(/family=([^&:]+)/);
        if (match) fonts.push(match[1].replace(/\+/g, ' '));
      }
    });
    
    // Detect common libraries
    if (html.includes('jquery')) libraries.push('jQuery');
    if (html.includes('bootstrap')) libraries.push('Bootstrap');
    if (html.includes('react')) libraries.push('React');
    if (html.includes('vue')) libraries.push('Vue.js');
    if (html.includes('angular')) libraries.push('Angular');
    if (html.includes('tailwind')) libraries.push('Tailwind CSS');
    
    return { images, links, fonts, colors, libraries };
  }

  private async detectTechnology(page: puppeteer.Page, html: string): Promise<TechnologyStack> {
    // Check for framework indicators in HTML
    let framework = 'HTML/CSS/JS';
    let cms = undefined;
    let language = 'JavaScript';
    let buildTool = undefined;
    
    // WordPress detection
    if (html.includes('wp-content') || html.includes('wordpress')) {
      framework = 'WordPress';
      cms = 'WordPress';
      language = 'PHP';
    }
    
    // React detection
    else if (html.includes('_next') || html.includes('__NEXT_DATA__')) {
      framework = 'Next.js';
      language = 'JavaScript';
      buildTool = 'Next.js';
    }
    
    // React general
    else if (html.includes('react') || html.includes('ReactDOM')) {
      framework = 'React';
      language = 'JavaScript';
    }
    
    // Vue.js
    else if (html.includes('vue') || html.includes('Vue')) {
      framework = 'Vue.js';
      language = 'JavaScript';
    }
    
    // Angular
    else if (html.includes('angular') || html.includes('ng-')) {
      framework = 'Angular';
      language = 'TypeScript';
    }
    
    // Laravel detection
    else if (html.includes('laravel') || html.includes('csrf-token')) {
      framework = 'Laravel';
      language = 'PHP';
    }
    
    // Check for additional technologies using page evaluation
    try {
      const pageInfo = await page.evaluate(() => {
        return {
          hasJQuery: typeof (window as any).$ !== 'undefined',
          hasReact: typeof (window as any).React !== 'undefined',
          hasVue: typeof (window as any).Vue !== 'undefined',
          hasAngular: typeof (window as any).angular !== 'undefined',
        };
      });
      
      if (pageInfo.hasReact && framework === 'HTML/CSS/JS') framework = 'React';
      if (pageInfo.hasVue && framework === 'HTML/CSS/JS') framework = 'Vue.js';
      if (pageInfo.hasAngular && framework === 'HTML/CSS/JS') framework = 'Angular';
    } catch (error) {
      console.log('Could not evaluate page technologies:', error);
    }
    
    return {
      framework,
      cms,
      language,
      buildTool,
    };
  }
}

// Singleton instance
export const websiteAnalyzer = new WebsiteAnalyzer();