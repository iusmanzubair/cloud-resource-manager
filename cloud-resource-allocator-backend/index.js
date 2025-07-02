import express from "express"
import cors from "cors"
import { spawn } from "child_process"

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/fcfs', (req, res) => {
    const fcfsProcess = spawn('./algorithms/fcfs', ['--service']);

    const { arrivals, bursts } = req.body;
    
    if (!fcfsProcess || fcfsProcess.killed) {
        return res.status(500).json({ error: "FCFS service not available" });
    }
    
    const input = `${arrivals.join(',')};${bursts.join(',')}\n`;
    
    fcfsProcess.stdin.write(input);
    
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
    
});

app.post('/api/sjf', (req, res) => {
    const sjfProcess = spawn('./algorithms/sjf', ['--service']);

    const { arrivals, bursts } = req.body;
    
    if (!sjfProcess || sjfProcess.killed) {
        return res.status(500).json({ error: "SJF service not available" });
    }
    
    const input = `${arrivals.join(',')};${bursts.join(',')}\n`;
    
    sjfProcess.stdin.write(input);
    
    const listener = (data) => {
        const output = data.toString().trim();
        sjfProcess.stdout.off('data', listener);
        
        try {
            const processes = output.split('|')
                .filter(x => x)
                .map(procStr => {
                    const [id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime] = 
                        procStr.split(',').map(Number);
                    return { id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime };
                });
            
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
            res.status(500).json({ error: "Failed to parse SJF output" });
        }
    };
    
    sjfProcess.stdout.on('data', listener);
    
});

app.post('/api/priority', (req, res) => {
    const priorityProcess = spawn('./algorithms/priority', ['--service']);

    const { arrivals, bursts, priorities } = req.body;
    
    if (!priorityProcess || priorityProcess.killed) {
        return res.status(500).json({ error: "Priority Scheduling service not available" });
    }
    
    const input = `${arrivals.join(',')};${bursts.join(',')};${priorities.join(',')}\n`;
    console.log(input)
    
    priorityProcess.stdin.write(input);
    
    const listener = (data) => {
        const output = data.toString().trim();
        priorityProcess.stdout.off('data', listener);
        
        try {
            const processes = output.trim().split('|')
                .filter(proc => proc)
                .map(procStr => {
                    const [id, arrivalTime, burstTime, priority, completionTime, turnaroundTime, waitingTime] = 
                        procStr.split(',').map(Number);

                    return { id, arrivalTime, burstTime, priority, completionTime, turnaroundTime, waitingTime };
                });
            
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
            res.status(500).json({ error: "Failed to parse Priority output" });
        }
    };
    
    priorityProcess.stdout.on('data', listener);
    
});

app.post('/api/srtf', (req, res) => {
    const srtfProcess = spawn('./algorithms/srtf', ['--service']);

    const { arrivals, bursts } = req.body;
    
    if (!srtfProcess || srtfProcess.killed) {
        return res.status(500).json({ error: "srtf service not available" });
    }
    
    const input = `${arrivals.join(',')};${bursts.join(',')}\n`;
    
    srtfProcess.stdin.write(input);
    
    const listener = (data) => {
        const output = data.toString().trim();
        srtfProcess.stdout.off('data', listener);
        
        try {
            const processes = output.split('|')
                .filter(x => x)
                .map(procStr => {
                    const [id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime] = 
                        procStr.split(',').map(Number);
                    return { id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime };
                });
            
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
            res.status(500).json({ error: "Failed to parse SRTF output" });
        }
    };
    
    srtfProcess.stdout.on('data', listener);
});

app.post('/api/roundrobin', (req, res) => {
    const rrProcess = spawn('./algorithms/rr', ['--service']);

    const { arrivals, bursts } = req.body;
    
    if (!rrProcess || rrProcess.killed) {
        return res.status(500).json({ error: "RR service not available" });
    }
    
    const input = `${arrivals.join(',')};${bursts.join(',')}\n`;
    
    rrProcess.stdin.write(input);
    
    const listener = (data) => {
        const output = data.toString().trim();
        rrProcess.stdout.off('data', listener);
        
        try {
            const processes = output.split('|')
                .filter(x => x)
                .map(procStr => {
                    const [id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime] = 
                        procStr.split(',').map(Number);
                    return { id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime };
                });
            
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
            res.status(500).json({ error: "Failed to parse RR output" });
        }
    };
    
    rrProcess.stdout.on('data', listener);
});


app.post('/api/fifo', (req, res) => {

    const fifoProcess = spawn('./algorithms/fifo', ['--service']);
    const { ramSlots, diskPages } = req.body;
    
    if (!ramSlots || !diskPages) {
        return res.status(400).json({ error: "Missing ramSlots or diskPages" });
    }

    if (!fifoProcess || fifoProcess.killed) {
        return res.status(500).json({ error: "FIFO service not available" });
    }

    const input = `${ramSlots};${diskPages.join(',')}\n`;
    fifoProcess.stdin.write(input);

    const listener = (data) => {
        const output = data.toString().trim();
        fifoProcess.stdout.off('data', listener);

        try {
            const [pageHits, pageFaults] = output.split(',').map(Number);
            
            res.json({
                pageHits,
                pageFaults
            });
        } catch (err) {
            res.status(500).json({ error: "Failed to parse FIFO output" });
        }
    };

    fifoProcess.stdout.once('data', listener);
});

app.post('/api/lru', (req, res) => {

    const lruProcess = spawn('./algorithms/lru', ['--service']);
    const { ramSlots, diskPages } = req.body;
    
    if (!ramSlots || !diskPages) {
        return res.status(400).json({ error: "Missing ramSlots or diskPages" });
    }

    if (!lruProcess || lruProcess.killed) {
        return res.status(500).json({ error: "LRU service not available" });
    }

    const input = `${ramSlots};${diskPages.join(',')}\n`;
    lruProcess.stdin.write(input);

    const listener = (data) => {
        const output = data.toString().trim();
        lruProcess.stdout.off('data', listener);

        try {
            const [pageHits, pageFaults] = output.split(',').map(Number);
            
            res.json({
                pageHits,
                pageFaults
            });
        } catch (err) {
            res.status(500).json({ error: "Failed to parse LRU output" });
        }
    };

    lruProcess.stdout.once('data', listener);
});


app.listen(4000, () => {
    console.log(`Server running on port 4000`);
});