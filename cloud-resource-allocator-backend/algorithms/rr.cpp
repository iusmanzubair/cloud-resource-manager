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
    
    for (int i = 0; i < n; i++) {
        processes.push_back({i+1, arrivals[i], bursts[i], bursts[i], 0, 0, 0});
    }

    queue<Process*> readyQueue;
    int currentTime = 0;
    int completed = 0;
    Process* current = nullptr;
    int quantumUsed = 0;

    while (completed < n) {
        for (auto& p : processes) {
            if (p.arrivalTime == currentTime && p.remainingTime > 0) {
                readyQueue.push(&p);
            }
        }

        if (current && (quantumUsed >= TIME_QUANTUM || current->remainingTime == 0)) {
            if (current->remainingTime > 0) {
                readyQueue.push(current); 
            }
            current = nullptr;
        }

        if (!current && !readyQueue.empty()) {
            current = readyQueue.front();
            readyQueue.pop();
            quantumUsed = 0;
        }

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

void runAsService() {
    string input;
    while (getline(cin, input)) {
        size_t sep = input.find(';');
        vector<int> arrivals, bursts;
        
        char* token = strtok(const_cast<char*>(input.substr(0, sep).c_str()), ",");
        while (token) {
            arrivals.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        token = strtok(const_cast<char*>(input.substr(sep + 1).c_str()), ",");
        while (token) {
            bursts.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        auto results = calculateRR(arrivals, bursts);
        
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