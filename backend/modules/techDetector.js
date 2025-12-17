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
      
      // Backend Framework Detection
      if (dependencies.express) {
        techStack.push({
          name: 'Express.js',
          version: dependencies.express,
          type: 'framework',
          category: 'Backend'
        });
      }
      
      if (dependencies.fastify) {
        techStack.push({
          name: 'Fastify',
          version: dependencies.fastify,
          type: 'framework',
          category: 'Backend'
        });
      }
      
      if (dependencies.koa) {
        techStack.push({
          name: 'Koa.js',
          version: dependencies.koa,
          type: 'framework',
          category: 'Backend'
        });
      }
      
      if (dependencies.hapi || dependencies['@hapi/hapi']) {
        techStack.push({
          name: 'Hapi.js',
          version: dependencies.hapi || dependencies['@hapi/hapi'],
          type: 'framework',
          category: 'Backend'
        });
      }
      
      if (dependencies.nestjs || dependencies['@nestjs/core']) {
        techStack.push({
          name: 'NestJS',
          version: dependencies['@nestjs/core'] || dependencies.nestjs,
          type: 'framework',
          category: 'Backend'
        });
      }
      
      // Database Detection
      if (dependencies.mongoose) {
        techStack.push({
          name: 'Mongoose (MongoDB)',
          version: dependencies.mongoose,
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.sequelize) {
        techStack.push({
          name: 'Sequelize ORM',
          version: dependencies.sequelize,
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.prisma || dependencies['@prisma/client']) {
        techStack.push({
          name: 'Prisma ORM',
          version: dependencies.prisma || dependencies['@prisma/client'],
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.typeorm) {
        techStack.push({
          name: 'TypeORM',
          version: dependencies.typeorm,
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.mysql || dependencies.mysql2) {
        techStack.push({
          name: 'MySQL',
          version: dependencies.mysql || dependencies.mysql2,
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.pg) {
        techStack.push({
          name: 'PostgreSQL',
          version: dependencies.pg,
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.redis) {
        techStack.push({
          name: 'Redis',
          version: dependencies.redis,
          type: 'database',
          category: 'Backend'
        });
      }
      
      // NoSQL Databases
      if (dependencies.mongodb) {
        techStack.push({
          name: 'MongoDB Native',
          version: dependencies.mongodb,
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.cassandra || dependencies['cassandra-driver']) {
        techStack.push({
          name: 'Apache Cassandra',
          version: dependencies.cassandra || dependencies['cassandra-driver'],
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.couchdb || dependencies.nano) {
        techStack.push({
          name: 'CouchDB',
          version: dependencies.couchdb || dependencies.nano,
          type: 'database',
          category: 'Backend'
        });
      }
      
      // SQLite
      if (dependencies.sqlite3 || dependencies.sqlite) {
        techStack.push({
          name: 'SQLite',
          version: dependencies.sqlite3 || dependencies.sqlite,
          type: 'database',
          category: 'Backend'
        });
      }
      
      // Cloud Databases
      if (dependencies['@aws-sdk/client-dynamodb'] || dependencies['aws-sdk']) {
        techStack.push({
          name: 'AWS DynamoDB',
          version: dependencies['@aws-sdk/client-dynamodb'] || dependencies['aws-sdk'],
          type: 'database',
          category: 'Backend'
        });
      }
      
      if (dependencies.firebase || dependencies['firebase-admin']) {
        techStack.push({
          name: 'Firebase Firestore',
          version: dependencies.firebase || dependencies['firebase-admin'],
          type: 'database',
          category: 'Backend'
        });
      }
      
      // Graph Databases
      if (dependencies.neo4j || dependencies['neo4j-driver']) {
        techStack.push({
          name: 'Neo4j',
          version: dependencies.neo4j || dependencies['neo4j-driver'],
          type: 'database',
          category: 'Backend'
        });
      }
      
      // Search Engines
      if (dependencies.elasticsearch || dependencies['@elastic/elasticsearch']) {
        techStack.push({
          name: 'Elasticsearch',
          version: dependencies.elasticsearch || dependencies['@elastic/elasticsearch'],
          type: 'database',
          category: 'Backend'
        });
      }
      
      // API Framework Detection by File Structure
      const backendFiles = this.scanForBackendFiles(projectPath);
      backendFiles.forEach(item => techStack.push(item));
      
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
      
      // Docker Detection
      if (fs.existsSync(path.join(projectPath, 'Dockerfile'))) {
        techStack.push({
          name: 'Docker',
          version: 'detected',
          type: 'containerization',
          category: 'DevOps'
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
    // Check for fullstack frameworks
    if (dependencies.next) return 'Next.js Fullstack';
    if (dependencies.nuxt) return 'Nuxt.js Fullstack';
    
    // Check for backend frameworks with database info
    const dbType = this.getDatabaseType(dependencies);
    
    if (dependencies.nestjs || dependencies['@nestjs/core']) {
      return dbType ? `NestJS + ${dbType} Backend` : 'NestJS Backend';
    }
    if (dependencies.fastify) {
      return dbType ? `Fastify + ${dbType} Backend` : 'Fastify Backend';
    }
    if (dependencies.koa) {
      return dbType ? `Koa.js + ${dbType} Backend` : 'Koa.js Backend';
    }
    if (dependencies.hapi || dependencies['@hapi/hapi']) {
      return dbType ? `Hapi.js + ${dbType} Backend` : 'Hapi.js Backend';
    }
    if (dependencies.express) {
      return dbType ? `Express + ${dbType} Backend` : 'Express.js Backend';
    }
    
    // Check for frontend frameworks
    if (dependencies.react && !this.hasBackendDeps(dependencies)) return 'React Frontend';
    if (dependencies.vue && !this.hasBackendDeps(dependencies)) return 'Vue.js Frontend';
    if (dependencies.angular || dependencies['@angular/core']) return 'Angular Frontend';
    if (dependencies.svelte) return 'Svelte Frontend';
    
    // Check for backend indicators
    if (this.hasBackendDeps(dependencies)) return 'Node.js Backend';
    if (fs.existsSync(path.join(projectPath, 'server.js'))) return 'Node.js Backend';
    if (fs.existsSync(path.join(projectPath, 'app.js'))) return 'Node.js Backend';
    if (fs.existsSync(path.join(projectPath, 'index.js')) && 
        fs.existsSync(path.join(projectPath, 'package.json'))) {
      // Check if it's likely a backend project
      const packageContent = fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8');
      if (packageContent.includes('"start"') && packageContent.includes('node')) {
        return 'Node.js Backend';
      }
    }
    
    return 'JavaScript Project';
  }
  
  hasBackendDeps(dependencies) {
    const backendIndicators = [
      // Frameworks
      'express', 'fastify', 'koa', 'hapi', '@hapi/hapi', 'nestjs', '@nestjs/core',
      // ORMs and Database Libraries
      'mongoose', 'sequelize', 'prisma', '@prisma/client', 'typeorm',
      // Database Drivers
      'mysql', 'mysql2', 'pg', 'redis', 'mongodb', 'sqlite3', 'sqlite',
      'cassandra-driver', 'neo4j-driver', 'elasticsearch', '@elastic/elasticsearch',
      // Cloud Databases
      '@aws-sdk/client-dynamodb', 'firebase-admin', 'firebase',
      // Middleware
      'cors', 'helmet', 'morgan', 'body-parser', 'multer', 'passport',
      // Server utilities
      'nodemailer', 'bcrypt', 'jsonwebtoken', 'socket.io'
    ];
    return backendIndicators.some(dep => dependencies[dep]);
  }
  
  getDatabaseType(dependencies) {
    if (dependencies.mongoose || dependencies.mongodb) return 'MongoDB';
    if (dependencies.pg) return 'PostgreSQL';
    if (dependencies.mysql || dependencies.mysql2) return 'MySQL';
    if (dependencies.sqlite3 || dependencies.sqlite) return 'SQLite';
    if (dependencies.redis) return 'Redis';
    if (dependencies['@aws-sdk/client-dynamodb']) return 'DynamoDB';
    if (dependencies.firebase || dependencies['firebase-admin']) return 'Firestore';
    if (dependencies['cassandra-driver']) return 'Cassandra';
    if (dependencies['neo4j-driver']) return 'Neo4j';
    if (dependencies.elasticsearch) return 'Elasticsearch';
    return null;
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

  scanForBackendFiles(projectPath) {
    const backendIndicators = [];
    
    try {
      // Check for common backend file patterns
      const commonPaths = [
        'server.js', 'app.js', 'index.js', 'main.js',
        'src/server.js', 'src/app.js', 'src/index.js',
        'server/index.js', 'server/app.js',
        'api/index.js', 'backend/index.js'
      ];
      
      for (const filePath of commonPaths) {
        const fullPath = path.join(projectPath, filePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for Express patterns
          if (content.includes('express()') || content.includes('app.listen')) {
            backendIndicators.push({
              name: 'Express.js Server',
              version: 'detected',
              type: 'server',
              category: 'Backend',
              file: filePath
            });
          }
          
          // Check for API routes
          if (content.includes('app.get') || content.includes('app.post') || 
              content.includes('router.') || content.includes('/api/')) {
            backendIndicators.push({
              name: 'REST API',
              version: 'detected',
              type: 'api',
              category: 'Backend',
              file: filePath
            });
          }
          
          // Check for database connections
          if (content.includes('mongoose.connect') || content.includes('MongoClient')) {
            backendIndicators.push({
              name: 'MongoDB Connection',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
          
          if (content.includes('sequelize') || content.includes('new Sequelize')) {
            backendIndicators.push({
              name: 'Sequelize Connection',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
          
          // Prisma detection
          if (content.includes('PrismaClient') || content.includes('@prisma/client')) {
            backendIndicators.push({
              name: 'Prisma Client',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
          
          // Redis detection
          if (content.includes('redis.createClient') || content.includes('Redis(')) {
            backendIndicators.push({
              name: 'Redis Connection',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
          
          // PostgreSQL detection
          if (content.includes('pg.Pool') || content.includes('pg.Client')) {
            backendIndicators.push({
              name: 'PostgreSQL Connection',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
          
          // MySQL detection
          if (content.includes('mysql.createConnection') || content.includes('mysql2')) {
            backendIndicators.push({
              name: 'MySQL Connection',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
          
          // SQLite detection
          if (content.includes('sqlite3.Database') || content.includes('better-sqlite3')) {
            backendIndicators.push({
              name: 'SQLite Connection',
              version: 'detected',
              type: 'database-connection',
              category: 'Backend',
              file: filePath
            });
          }
        }
      }
      
      // Check for API directories
      const apiDirs = ['api', 'routes', 'controllers', 'endpoints'];
      for (const dir of apiDirs) {
        const dirPath = path.join(projectPath, dir);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          const files = fs.readdirSync(dirPath);
          if (files.length > 0) {
            backendIndicators.push({
              name: `${dir.charAt(0).toUpperCase() + dir.slice(1)} Directory`,
              version: `${files.length} files`,
              type: 'api-structure',
              category: 'Backend',
              file: dir
            });
          }
        }
      }
      
      // Check for database config files
      const dbConfigFiles = [
        'prisma/schema.prisma',
        'database.json',
        'knexfile.js',
        'sequelize.config.js',
        'typeorm.config.js',
        'ormconfig.json',
        'migrations',
        'seeds'
      ];
      
      for (const configFile of dbConfigFiles) {
        const configPath = path.join(projectPath, configFile);
        if (fs.existsSync(configPath)) {
          const isDir = fs.statSync(configPath).isDirectory();
          backendIndicators.push({
            name: `Database ${isDir ? 'Directory' : 'Config'}`,
            version: path.basename(configFile),
            type: 'database-config',
            category: 'Backend',
            file: configFile
          });
        }
      }
      
      // Check for middleware directories
      const middlewareDirs = ['middleware', 'middlewares', 'auth'];
      for (const dir of middlewareDirs) {
        const dirPath = path.join(projectPath, dir);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          backendIndicators.push({
            name: 'Middleware',
            version: 'detected',
            type: 'middleware',
            category: 'Backend',
            file: dir
          });
        }
      }
      
    } catch (error) {
      console.error('Error scanning for backend files:', error);
    }
    
    return backendIndicators;
  }
  
  isDevelopmentDependency(name) {
    const devKeywords = ['test', 'dev', 'build', 'webpack', 'babel', 'eslint', 'prettier', 'jest', 'mocha', 'chai'];
    return devKeywords.some(keyword => name.includes(keyword));
  }
}

module.exports = new TechDetector();