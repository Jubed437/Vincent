// Test script to verify comprehensive backend and database detection
const techDetector = require('./backend/modules/techDetector');
const path = require('path');

// Test with different database scenarios
const testCases = [
  {
    name: 'Express + MongoDB',
    packageJson: {
      dependencies: {
        express: "^4.18.2",
        mongoose: "^7.0.0",
        cors: "^2.8.5"
      }
    }
  },
  {
    name: 'NestJS + PostgreSQL',
    packageJson: {
      dependencies: {
        '@nestjs/core': "^9.0.0",
        '@nestjs/typeorm': "^9.0.0",
        typeorm: "^0.3.0",
        pg: "^8.8.0"
      }
    }
  },
  {
    name: 'Express + Prisma + MySQL',
    packageJson: {
      dependencies: {
        express: "^4.18.2",
        '@prisma/client': "^4.0.0",
        mysql2: "^3.0.0"
      }
    }
  },
  {
    name: 'Fastify + Redis + SQLite',
    packageJson: {
      dependencies: {
        fastify: "^4.0.0",
        redis: "^4.0.0",
        sqlite3: "^5.0.0"
      }
    }
  }
];

console.log('🔍 Testing comprehensive database detection...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Testing: ${testCase.name}`);
  console.log('=' .repeat(50));
  
  const result = techDetector.detectTechStack(__dirname, testCase.packageJson);
  
  if (result.success) {
    console.log('✅ Detection successful!');
    console.log('📊 Project Type:', result.data.projectType);
    
    console.log('\n🔧 Tech Stack:');
    result.data.techStack.forEach(tech => {
      const icon = tech.category === 'Backend' && tech.type === 'database' ? '🗄️' : '⚙️';
      console.log(`  ${icon} ${tech.name} (${tech.category}) - ${tech.type}`);
    });
    
    const databases = result.data.techStack.filter(tech => tech.type === 'database');
    if (databases.length > 0) {
      console.log('\n🗄️  Detected Databases:');
      databases.forEach(db => {
        console.log(`  - ${db.name} v${db.version}`);
      });
    }
  } else {
    console.log('❌ Detection failed:', result.message);
  }
});

console.log('\n🎉 Database detection test completed!');