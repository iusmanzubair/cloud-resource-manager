#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <climits>
#include <fstream>
#include <string>
#include <cstring>

using namespace std;

const int TIME_QUANTUM = 3;

struct Process {
    int id;
    int arrivalTime;
    int burstTime;
    int remainingTime;
    int completionTime;
    int turnaroundTime;
    int waitingTime;
};

vector<Process> calculateRR(const vector<int>& arrivals, const vector<int>& bursts) {
    vector<Process> processes;
    int n = arrivals.size();
    
    // Initialize processes
    for (int i = 0; i < n; i++) {
        processes.push_back({i+1, arrivals[i], bursts[i], bursts[i], 0, 0, 0});
    }

    queue<Process*> readyQueue;
    int currentTime = 0;
    int completed = 0;
    Process* current = nullptr;
    int quantumUsed = 0;

    while (completed < n) {
        // Add arriving processes to ready queue
        for (auto& p : processes) {
            if (p.arrivalTime == currentTime && p.remainingTime > 0) {
                readyQueue.push(&p);
            }
        }

        // If current process finished its quantum or completed
        if (current && (quantumUsed >= TIME_QUANTUM || current->remainingTime == 0)) {
            if (current->remainingTime > 0) {
                readyQueue.push(current); // Put back in queue if not finished
            }
            current = nullptr;
        }

        // Get next process if none running
        if (!current && !readyQueue.empty()) {
            current = readyQueue.front();
            readyQueue.pop();
            quantumUsed = 0;
        }

        // Execute current process
        if (current) {
            current->remainingTime--;
            quantumUsed++;
            
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

// Identical IPC structure to FCFS/SRTF
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
        
        // Calculate RR
        auto results = calculateRR(arrivals, bursts);
        
        // Same output format as FCFS/SRTF
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
        // Test mode (same structure)
        vector<int> arrivals = {0, 1, 2, 4};
        vector<int> bursts = {5, 3, 8, 6};
        
        auto results = calculateRR(arrivals, bursts);
        
        cout << "Round Robin (Quantum=3) Results:\n";
        cout << "PID\tArrival\tBurst\tCompletion\tTurnaround\tWaiting\n";
        for (const auto& p : results) {
            cout << p.id << "\t" << p.arrivalTime << "\t" << p.burstTime << "\t"
                 << p.completionTime << "\t\t" << p.turnaroundTime << "\t\t" << p.waitingTime << "\n";
        }
    }
    return 0;
}