const fs = require('fs');
const path = require('path');

class TechDetector {
  detectTechStack(projectPath, packageJson) {
    try {
      const techStack = [];
      const dependencies = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
      
      // Framework Detection
      if (dependencies.react) {
        techStack.push({
          name: 'React',
          version: dependencies.react,
          type: 'framework',
          category: 'Frontend'
        });
      }
      
      if (dependencies.next) {
        techStack.push({
          name: 'Next.js',
          version: dependencies.next,
          type: 'framework',
          category: 'Fullstack'
        });
      }
      
      if (dependencies.express) {
        techStack.push({
          name: 'Express',
          version: dependencies.express,
          type: 'framework',
          category: 'Backend'
        });
      }
      
      // Database Detection
      if (dependencies.mongoose) {
        techStack.push({
          name: 'Mongoose',
          version: dependencies.mongoose,
          type: 'database',
          category: 'Backend'
        });
      }
      
      // Build Tools
      if (fs.existsSync(path.join(projectPath, 'vite.config.js'))) {
        techStack.push({
          name: 'Vite',
          version: dependencies.vite || 'detected',
          type: 'build-tool',
          category: 'Development'
        });
      }
      
      if (fs.existsSync(path.join(projectPath, 'webpack.config.js'))) {
        techStack.push({
          name: 'Webpack',
          version: dependencies.webpack || 'detected',
          type: 'build-tool',
          category: 'Development'
        });
      }
      
      // Project Type Classification
      const projectType = this.classifyProject(dependencies, projectPath);
      
      return {
        success: true,
        data: {
          techStack,
          projectType,
          dependencies: this.categorizeDependencies(dependencies)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Tech detection failed: ${error.message}`
      };
    }
  }

  classifyProject(dependencies, projectPath) {
    if (dependencies.next) return 'Next.js Fullstack';
    if (dependencies.react && !dependencies.express) return 'React Frontend';
    if (dependencies.express && dependencies.mongoose) return 'Express + MongoDB Backend';
    if (dependencies.express) return 'Express API';
    if (fs.existsSync(path.join(projectPath, 'server.js'))) return 'Node.js Backend';
    return 'JavaScript Project';
  }

  categorizeDependencies(dependencies) {
    const categorized = {
      production: [],
      development: []
    };
    
    Object.entries(dependencies).forEach(([name, version]) => {
      const category = this.isDevelopmentDependency(name) ? 'development' : 'production';
      categorized[category].push({
        name,
        version,
        status: 'installed'
      });
    });
    
    return categorized;
  }

  isDevelopmentDependency(name) {
    const devKeywords = ['test', 'dev', 'build', 'webpack', 'babel', 'eslint', 'prettier'];
    return devKeywords.some(keyword => name.includes(keyword));
  }
}

module.exports = new TechDetector();