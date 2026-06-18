const { execSync } = require('child_process');

if (process.env.RENDER === 'true') {
    console.log('--- Render Environment Detected: Building Client Frontend ---');
    try {
        execSync('npm install && npm run build', { cwd: 'client', stdio: 'inherit' });
        console.log('--- Client Frontend Built Successfully ---');
    } catch (error) {
        console.error('--- Client Frontend Build Failed ---', error);
        process.exit(1);
    }
} else {
    console.log('--- Non-Render Environment: Skipping automatic client build ---');
}
