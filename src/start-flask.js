const { exec } = require('child_process');

// Start the Flask app from the /backend directory
exec('cd ./backend && python app.py', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error starting Flask app: ${err}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

// Start the frontend using http-server
exec('http-server ./frontend -p 8000', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error starting frontend: ${err}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
