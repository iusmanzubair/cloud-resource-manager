#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <climits>
#include <fstream>
#include <string>
#include <cstring>

using namespace std;

struct Process {
    int id;
    int arrivalTime;
    int burstTime;
    int remainingTime;
    int completionTime;
    int turnaroundTime;
    int waitingTime;
};

vector<Process> calculateSRTF(const vector<int>& arrivals, const vector<int>& bursts) {
    vector<Process> processes;
    int n = arrivals.size();
    
    // Initialize processes
    for (int i = 0; i < n; i++) {
        processes.push_back({i+1, arrivals[i], bursts[i], bursts[i], 0, 0, 0});
    }

    auto comp = [](Process* a, Process* b) { 
        return a->remainingTime > b->remainingTime; // Min-heap based on remaining time
    };
    priority_queue<Process*, vector<Process*>, decltype(comp)> readyQueue(comp);

    int currentTime = 0;
    int completed = 0;
    Process* current = nullptr;

    while (completed < n) {
        // Add arriving processes to ready queue
        for (auto& p : processes) {
            if (p.arrivalTime == currentTime && p.remainingTime > 0) {
                readyQueue.push(&p);
            }
        }

        // Preempt if a shorter process arrives
        if (current && !readyQueue.empty() && readyQueue.top()->remainingTime < current->remainingTime) {
            readyQueue.push(current);
            current = readyQueue.top();
            readyQueue.pop();
        }

        // If no process running, get next from queue
        if (!current && !readyQueue.empty()) {
            current = readyQueue.top();
            readyQueue.pop();
        }

        // Execute current process
        if (current) {
            current->remainingTime--;
            if (current->remainingTime == 0) {
                current->completionTime = currentTime + 1;
                current->turnaroundTime = current->completionTime - current->arrivalTime;
                current->waitingTime = current->turnaroundTime - current->burstTime;
                completed++;
                current = nullptr;
            }
        }

        currentTime++;
    }

    return processes;
}

// IPC with Node.js (identical to FCFS)
void runAsService() {
    string input;
    while (getline(cin, input)) {
        size_t sep = input.find(';');
        vector<int> arrivals, bursts;
        
        // Parse arrivals
        char* token = strtok(const_cast<char*>(input.substr(0, sep).c_str()), ",");
        while (token) {
            arrivals.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        // Parse bursts
        token = strtok(const_cast<char*>(input.substr(sep + 1).c_str()), ",");
        while (token) {
            bursts.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        // Calculate SRTF
        auto results = calculateSRTF(arrivals, bursts);
        
        // Format output for Node.js (same as FCFS)
        for (const auto& p : results) {
            cout << p.id << "," << p.arrivalTime << "," << p.burstTime << ","
                 << p.completionTime << "," << p.turnaroundTime << "," << p.waitingTime << "|";
        }
        cout << endl;
    }
}

int main(int argc, char* argv[]) {
    if (argc > 1 && strcmp(argv[1], "--service") == 0) {
        runAsService();
    } else {
        // Test mode (same structure as FCFS)
        vector<int> arrivals = {0, 1, 2, 4};
        vector<int> bursts = {5, 3, 8, 6};
        
        auto results = calculateSRTF(arrivals, bursts);
        
        cout << "SRTF Scheduling Results:\n";
        cout << "PID\tArrival\tBurst\tCompletion\tTurnaround\tWaiting\n";
        for (const auto& p : results) {
            cout << p.id << "\t" << p.arrivalTime << "\t" << p.burstTime << "\t"
                 << p.completionTime << "\t\t" << p.turnaroundTime << "\t\t" << p.waitingTime << "\n";
        }
    }
    return 0;
}