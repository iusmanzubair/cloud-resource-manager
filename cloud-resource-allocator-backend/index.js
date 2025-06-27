import express from "express"
import cors from "cors"
import { spawn } from "child_process"

const app = express();
app.use(cors());
app.use(express.json());

let fcfsProcess;

// function startFCFSService() {
    
//     fcfsProcess.stdout.on('data', (data) => {
//         console.log(`FCFS: ${data}`);
//     });
    
//     fcfsProcess.stderr.on('data', (data) => {
//         console.error(`FCFS Error: ${data}`);
//     });
    
//     fcfsProcess.on('close', (code) => {
//         console.log(`FCFS process exited with code ${code}`);
//         // Auto-restart
//         setTimeout(startFCFSService, 1000);
//     });
// }

app.post('/api/fcfs', (req, res) => {
    fcfsProcess = spawn('./fcfs', ['--service']);

    const { arrivals, bursts } = req.body;
    
    if (!fcfsProcess || fcfsProcess.killed) {
        return res.status(500).json({ error: "FCFS service not available" });
    }
    
    // Format input for C++ program
    const input = `${arrivals.join(',')};${bursts.join(',')}\n`;
    
    fcfsProcess.stdin.write(input);
    
    // Collect response
    const listener = (data) => {
        const output = data.toString().trim();
        fcfsProcess.stdout.off('data', listener);
        
        try {
            const processes = output.split('|')
                .filter(x => x)
                .map(procStr => {
                    const [id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime] = 
                        procStr.split(',').map(Number);
                    return { id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime };
                });
            
            // Calculate averages
            const avgTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length;
            const avgWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length;
            const throughput = processes.length / Math.max(...processes.map(p => p.completionTime));
            
            res.json({
                processes,
                avgTurnaroundTime,
                avgWaitingTime,
                throughput
            });
        } catch (err) {
            res.status(500).json({ error: "Failed to parse FCFS output" });
        }
    };
    
    fcfsProcess.stdout.on('data', listener);
    
    // // Timeout fallback
    // setTimeout(() => {
    //     fcfsProcess.stdout.off('data', listener);
    //     res.status(500).json({ error: "FCFS response timeout" });
    // }, 5000);
});

// Start the FCFS service when server starts
// startFCFSService();

app.listen(4000, () => {
    console.log(`Server running on port 4000`);
});

// process.on('SIGTERM', () => {
//     fcfsProcess?.kill();
//     process.exit();
// });