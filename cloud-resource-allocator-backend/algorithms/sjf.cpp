#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <fstream>
#include <string>
#include <cstring>
#include <queue>

using namespace std;

struct Process {
    int id;
    int arrivalTime;
    int burstTime;
    int completionTime;
    int turnaroundTime;
    int waitingTime;
};

// Comparison function for SJF (prioritizes shorter jobs)
struct CompareBurst {
    bool operator()(const Process& a, const Process& b) {
        return a.burstTime > b.burstTime;
    }
};

vector<Process> calculateSJF(const vector<int>& arrivals, const vector<int>& bursts) {
    vector<Process> processes;
    int n = arrivals.size();
    
    // Create processes
    for (int i = 0; i < n; i++) {
        processes.push_back({i + 1, arrivals[i], bursts[i], 0, 0, 0});
    }
    
    // Sort by arrival time (initial order)
    sort(processes.begin(), processes.end(), 
        [](const Process& a, const Process& b) { 
            return a.arrivalTime < b.arrivalTime; 
        });
    
    // Priority queue for SJF (shortest job first)
    priority_queue<Process, vector<Process>, CompareBurst> readyQueue;
    
    vector<Process> results;
    int currentTime = 0;
    int index = 0;
    
    while (index < n || !readyQueue.empty()) {
        // Add all processes that have arrived by currentTime
        while (index < n && processes[index].arrivalTime <= currentTime) {
            readyQueue.push(processes[index]);
            index++;
        }
        
        if (!readyQueue.empty()) {
            Process current = readyQueue.top();
            readyQueue.pop();
            
            if (currentTime < current.arrivalTime) {
                currentTime = current.arrivalTime;
            }
            
            current.completionTime = currentTime + current.burstTime;
            current.turnaroundTime = current.completionTime - current.arrivalTime;
            current.waitingTime = currentTime - current.arrivalTime;
            
            results.push_back(current);
            currentTime = current.completionTime;
        } else {
            // If no processes are ready, jump to next arrival time
            if (index < n) {
                currentTime = processes[index].arrivalTime;
            }
        }
    }
    
    // Sort results by completion time for output
    sort(results.begin(), results.end(),
        [](const Process& a, const Process& b) {
            return a.completionTime < b.completionTime;
        });
    
    return results;
}

// Function to handle IPC with Node.js
void runAsService() {
    string input;
    while (getline(cin, input)) {
        // Parse input from Node.js (format: "arrivals;bursts")
        size_t sep = input.find(';');
        vector<int> arrivals, bursts;
        
        // Parse arrivals
        string arrivals_str = input.substr(0, sep);
        char* token = strtok(const_cast<char*>(arrivals_str.c_str()), ",");
        while (token) {
            arrivals.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        // Parse bursts
        string bursts_str = input.substr(sep + 1);
        token = strtok(const_cast<char*>(bursts_str.c_str()), ",");
        while (token) {
            bursts.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        // Calculate SJF
        auto results = calculateSJF(arrivals, bursts);
        
        // Format output for Node.js
        for (const auto& p : results) {
            cout << p.id << "," << p.arrivalTime << "," << p.burstTime << ","
                 << p.completionTime << "," << p.turnaroundTime << "," << p.waitingTime << "|";
        }
        cout << endl;
    }
}

int main(int argc, char* argv[]) {
    if (argc > 1 && strcmp(argv[1], "--service") == 0) {
        // Running as a service for Node.js
        runAsService();
    } else {
        // Running in standalone mode with test data
        vector<int> arrivals = {0, 1, 2, 4};
        vector<int> bursts = {5, 3, 8, 6};
        
        auto results = calculateSJF(arrivals, bursts);
        
        cout << "SJF Scheduling Results:\n";
        cout << "PID\tArrival\tBurst\tCompletion\tTurnaround\tWaiting\n";
        for (const auto& p : results) {
            cout << p.id << "\t" << p.arrivalTime << "\t" << p.burstTime << "\t"
                 << p.completionTime << "\t\t" << p.turnaroundTime << "\t\t" 
                 << p.waitingTime << "\n";
        }
    }
    return 0;
}