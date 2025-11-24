class WorkflowTemplates {
  /**
   * Generate workflow description based on detected technologies
   */
  generateWorkflow(techStack, fileBreakdown) {
    const flags = this.analyzeTechFlags(techStack, fileBreakdown);
    
    if (flags.isNext) {
      return this.getNextJSWorkflow();
    } else if (flags.isExpress && flags.isReact && flags.isMongoose) {
      return this.getMERNWorkflow();
    } else if (flags.isExpress && flags.isMongoose) {
      return this.getExpressMongoWorkflow();
    } else if (flags.isExpress) {
      return this.getExpressWorkflow();
    } else if (flags.isReact) {
      return this.getReactWorkflow();
    } else {
      return this.getGenericJSWorkflow();
    }
  }

  /**
   * Analyze technology flags from tech stack and files
   */
  analyzeTechFlags(techStack, fileBreakdown) {
    const stackNames = techStack.map(t => t.name.toLowerCase());
    
    return {
      isExpress: stackNames.includes('express') || 
                 Object.values(fileBreakdown).some(f => f.type === 'express-server'),
      isReact: stackNames.includes('react') || 
               Object.values(fileBreakdown).some(f => f.type === 'react-component'),
      isNext: stackNames.includes('next.js') || stackNames.includes('next'),
      isMongoose: stackNames.includes('mongoose') || 
                  Object.values(fileBreakdown).some(f => f.type === 'mongoose-model'),
      isVite: stackNames.includes('vite'),
      isWebpack: stackNames.includes('webpack')
    };
  }

  /**
   * Next.js workflow template
   */
  getNextJSWorkflow() {
    return {
      type: 'Next.js Fullstack',
      description: 'Full-stack React application with server-side rendering',
      flow: [
        'Browser Request',
        'Next.js Router',
        'Page Component',
        'API Routes (if needed)',
        'Database (if connected)',
        'Server-Side Rendering',
        'Response to Browser'
      ],
      keyFiles: [
        'pages/_app.js - App wrapper',
        'pages/index.js - Home page',
        'pages/api/ - API endpoints',
        'components/ - React components'
      ],
      workflow: 'Request → Next Router → Page/API Route → SSR/Data Fetch → Response'
    };
  }

  /**
   * MERN stack workflow template
   */
  getMERNWorkflow() {
    return {
      type: 'MERN Stack',
      description: 'MongoDB, Express, React, Node.js full-stack application',
      flow: [
        'React Frontend',
        'HTTP Request (Axios/Fetch)',
        'Express Router',
        'Controller Logic',
        'Mongoose Model',
        'MongoDB Database',
        'JSON Response',
        'React State Update'
      ],
      keyFiles: [
        'server.js - Express server',
        'routes/ - API endpoints',
        'models/ - Mongoose schemas',
        'src/components/ - React components'
      ],
      workflow: 'React Component → API Call → Express Route → Controller → Mongoose Model → MongoDB → Response → State Update'
    };
  }

  /**
   * Express + MongoDB workflow template
   */
  getExpressMongoWorkflow() {
    return {
      type: 'Express + MongoDB Backend',
      description: 'RESTful API server with MongoDB database',
      flow: [
        'Client Request',
        'Express Middleware',
        'Route Handler',
        'Controller Logic',
        'Mongoose Model',
        'MongoDB Operation',
        'JSON Response'
      ],
      keyFiles: [
        'server.js - Main server file',
        'routes/ - API routes',
        'models/ - Database models',
        'middleware/ - Custom middleware'
      ],
      workflow: 'Request → Middleware → Route → Controller → Model → Database → Response'
    };
  }

  /**
   * Express-only workflow template
   */
  getExpressWorkflow() {
    return {
      type: 'Express.js API',
      description: 'RESTful API server built with Express.js',
      flow: [
        'HTTP Request',
        'Express Middleware',
        'Route Handler',
        'Business Logic',
        'Data Processing',
        'JSON Response'
      ],
      keyFiles: [
        'server.js - Express server',
        'routes/ - API endpoints',
        'controllers/ - Business logic'
      ],
      workflow: 'Request → Middleware → Route Handler → Business Logic → Response'
    };
  }

  /**
   * React-only workflow template
   */
  getReactWorkflow() {
    return {
      type: 'React Frontend',
      description: 'Single-page application built with React',
      flow: [
        'User Interaction',
        'Event Handler',
        'State Update',
        'Component Re-render',
        'API Calls (if needed)',
        'UI Update'
      ],
      keyFiles: [
        'src/App.js - Main component',
        'src/components/ - React components',
        'src/hooks/ - Custom hooks',
        'public/index.html - Entry point'
      ],
      workflow: 'User Input → Event Handler → State Change → Re-render → API Call → UI Update'
    };
  }

  /**
   * Generic JavaScript workflow template
   */
  getGenericJSWorkflow() {
    return {
      type: 'JavaScript Project',
      description: 'General JavaScript application or library',
      flow: [
        'Entry Point',
        'Module Loading',
        'Function Execution',
        'Data Processing',
        'Output/Export'
      ],
      keyFiles: [
        'index.js - Entry point',
        'src/ - Source code',
        'package.json - Configuration'
      ],
      workflow: 'Entry Point → Module Import → Function Execution → Data Processing → Output'
    };
  }

  /**
   * Generate development workflow steps
   */
  generateDevWorkflow(techStack, packageJson) {
    const steps = [];
    const scripts = packageJson?.scripts || {};

    // Installation step
    steps.push({
      step: 1,
      action: 'Install Dependencies',
      command: 'npm install',
      description: 'Install all project dependencies'
    });

    // Development step
    if (scripts.dev) {
      steps.push({
        step: 2,
        action: 'Start Development',
        command: 'npm run dev',
        description: 'Start development server with hot reload'
      });
    } else if (scripts.start) {
      steps.push({
        step: 2,
        action: 'Start Application',
        command: 'npm start',
        description: 'Start the application'
      });
    }

    // Testing step
    if (scripts.test) {
      steps.push({
        step: 3,
        action: 'Run Tests',
        command: 'npm test',
        description: 'Execute test suite'
      });
    }

    // Build step
    if (scripts.build) {
      steps.push({
        step: steps.length + 1,
        action: 'Build for Production',
        command: 'npm run build',
        description: 'Create production build'
      });
    }

    return steps;
  }

  /**
   * Generate deployment recommendations
   */
  generateDeploymentRecommendations(techStack, workflow) {
    const recommendations = [];

    switch (workflow.type) {
      case 'Next.js Fullstack':
        recommendations.push({
          platform: 'Vercel',
          reason: 'Optimized for Next.js applications',
          steps: ['Connect GitHub repo', 'Auto-deploy on push']
        });
        break;

      case 'React Frontend':
        recommendations.push({
          platform: 'Netlify',
          reason: 'Great for static React apps',
          steps: ['Build with npm run build', 'Deploy build folder']
        });
        break;

      case 'Express + MongoDB Backend':
        recommendations.push({
          platform: 'Railway/Render',
          reason: 'Good for Node.js backends with database',
          steps: ['Set environment variables', 'Connect MongoDB Atlas']
        });
        break;

      default:
        recommendations.push({
          platform: 'GitHub Pages',
          reason: 'Simple deployment for static sites',
          steps: ['Enable GitHub Pages', 'Push to gh-pages branch']
        });
    }

    return recommendations;
  }
}

module.exports = new WorkflowTemplates();