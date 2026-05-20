const fs = require('fs');
const path = require('path');

const frontendDist = path.join(__dirname, '../frontend/dist');
const backendPublic = path.join(__dirname, '../backend/public');

try {
  console.log('🧹 Cleaning old build files...');
  const expoFolder = path.join(backendPublic, '_expo');
  if (fs.existsSync(expoFolder)) {
    fs.rmSync(expoFolder, { recursive: true, force: true });
  }

  if (!fs.existsSync(frontendDist)) {
    throw new Error(`Frontend dist folder not found at: ${frontendDist}`);
  }

  console.log('📂 Copying frontend build to backend (preserving index.html)...');
  const files = fs.readdirSync(frontendDist);
  
  for (const file of files) {
    const srcPath = path.join(frontendDist, file);
    const destPath = path.join(backendPublic, file);
    
    if (file === 'index.html') {
      // Copy frontend index.html directly as app.html to avoid overwriting landing page
      const targetAppPath = path.join(backendPublic, 'app.html');
      fs.copyFileSync(srcPath, targetAppPath);
      console.log('🔄 Copied frontend index.html to backend app.html');
    } else {
      // Copy all other files/folders
      fs.cpSync(srcPath, destPath, { recursive: true });
    }
  }

  console.log('✨ Build merge completed successfully!');
} catch (error) {
  console.error('❌ Build merge failed:', error);
  process.exit(1);
}
