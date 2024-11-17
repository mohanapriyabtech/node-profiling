1.Run following command :

export ENABLE_PROFILING=true
node app.js


2.Test the Endpoints

-Visit http://localhost:3000/ to simulate a workload.
-Visit http://localhost:3000/work for another workload.
-View profiling files at http://localhost:3000/profiles.

3.Analyze Profiling Files

-CPU Profile (.cpuprofile): Open in Chrome DevTools under the Performance tab.
-Memory Snapshot (.heapsnapshot): Open in Chrome DevTools under the Memory tab.
-Monitor Event Loop Delays
-The event loop delay will be logged every second, helping you identify latency issues.

