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
    
    for (int i = 0; i < n; i++) {
        processes.push_back({i+1, arrivals[i], bursts[i], bursts[i], 0, 0, 0});
    }

    auto comp = [](Process* a, Process* b) { 
        return a->remainingTime > b->remainingTime; 
    };
    priority_queue<Process*, vector<Process*>, decltype(comp)> readyQueue(comp);

    int currentTime = 0;
    int completed = 0;
    Process* current = nullptr;

    while (completed < n) {
        for (auto& p : processes) {
            if (p.arrivalTime == currentTime && p.remainingTime > 0) {
                readyQueue.push(&p);
            }
        }

        if (current && !readyQueue.empty() && readyQueue.top()->remainingTime < current->remainingTime) {
            readyQueue.push(current);
            current = readyQueue.top();
            readyQueue.pop();
        }

        if (!current && !readyQueue.empty()) {
            current = readyQueue.top();
            readyQueue.pop();
        }

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

        ++currentTime;
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
        
        auto results = calculateSRTF(arrivals, bursts);
        
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