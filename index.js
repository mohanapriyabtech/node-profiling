const express = require('express');
const profiler = require('v8-profiler-next');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const app = express();
const PORT = 3000;

// Enable profiling based on environment variable
const isProfilingEnabled = process.env.ENABLE_PROFILING === 'true';

// Directory to save profiles
const profilesDir = path.join(__dirname, 'profiles');
if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
}

// Middleware for profiling
if (isProfilingEnabled) {
    app.use((req, res, next) => {
        console.log(`Starting CPU profiling for request: ${req.url}`);
        profiler.startProfiling(`Request to ${req.url}`);

        res.on('finish', () => {
            const profile = profiler.stopProfiling(`Request to ${req.url}`);
            const cpuProfileFile = path.join(profilesDir, `${req.url.replace(/\//g, '_')}_cpu.cpuprofile`);
            profile.export((error, result) => {
                if (!error) {
                    fs.writeFileSync(cpuProfileFile, result);
                    console.log(`CPU profile saved as ${cpuProfileFile}`);
                }
                profile.delete(); // Clean up
            });

            // Take memory snapshot
            const memorySnapshot = profiler.takeSnapshot(`Request to ${req.url}`);
            const memorySnapshotFile = path.join(profilesDir, `${req.url.replace(/\//g, '_')}_memory.heapsnapshot`);
            memorySnapshot.export((error, result) => {
                if (!error) {
                    fs.writeFileSync(memorySnapshotFile, result);
                    console.log(`Memory snapshot saved as ${memorySnapshotFile}`);
                }
                memorySnapshot.delete(); // Clean up
            });
        });

        next();
    });
}

// Monitor Event Loop Delay
if (isProfilingEnabled) {
    setInterval(() => {
        const start = performance.now();
        setTimeout(() => {
            const delay = performance.now() - start - 1000; // Subtract 1000ms interval
            console.log(`Event loop delay: ${delay.toFixed(2)}ms`);
        }, 1000);
    }, 1000);
}

// Simulated workload for testing
app.get('/', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 1e7; i++) sum += i; // Simulate heavy computation
    res.send('Hello, world!');
});

app.get('/work', (req, res) => {
    let product = 1;
    for (let i = 1; i < 1e5; i++) product *= i % 100; // Simulate workload
    res.send('Work done!');
});

// Endpoint to list profiling files
app.get('/profiles', (req, res) => {
    fs.readdir(profilesDir, (err, files) => {
        if (err) {
            res.status(500).send('Error reading profiles directory.');
            return;
        }

        res.send(files.map(file => path.join(profilesDir, file)));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (isProfilingEnabled) {
        console.log('Profiling is enabled. Profiling files will be saved in:', profilesDir);
    } else {
        console.log('Profiling is disabled. Set ENABLE_PROFILING=true to enable.');
    }
});
