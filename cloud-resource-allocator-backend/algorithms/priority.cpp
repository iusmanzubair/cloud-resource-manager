#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <string>
#include <cstring>

using namespace std;

struct Process {
    int id;
    int arrivalTime;
    int burstTime;
    int priority;
    int completionTime;
    int turnaroundTime;
    int waitingTime;
};

struct ComparePriority {
    bool operator()(const Process& a, const Process& b) {
        if (a.priority == b.priority) {
            return a.arrivalTime > b.arrivalTime; 
        }
        return a.priority > b.priority; 
    }
};

vector<Process> calculatePriority(const vector<int>& arrivals, const vector<int>& bursts, const vector<int>& priorities) {
    vector<Process> processes;
    int n = arrivals.size();
    
    for (int i = 0; i < n; i++) {
        processes.push_back({i + 1, arrivals[i], bursts[i], priorities[i], 0, 0, 0});
    }
    
    sort(processes.begin(), processes.end(), 
        [](const Process& a, const Process& b) { 
            return a.arrivalTime < b.arrivalTime; 
        });
    
    priority_queue<Process, vector<Process>, ComparePriority> readyQueue;
    vector<Process> results;
    int currentTime = 0;
    int index = 0;
    
    while (index < n || !readyQueue.empty()) {
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
            current.waitingTime = current.turnaroundTime - current.burstTime;
            
            results.push_back(current);
            currentTime = current.completionTime;
        } else {
            if (index < n) {
                currentTime = processes[index].arrivalTime;
            }
        }
    }
    
    sort(results.begin(), results.end(),
        [](const Process& a, const Process& b) {
            return a.completionTime < b.completionTime;
        });
    
    return results;
}

void runAsService() {
    string input;
    while (getline(cin, input)) {
        size_t sep1 = input.find(';');
        size_t sep2 = input.find(';', sep1 + 1);
        
        vector<int> arrivals, bursts, priorities;
        
        char* token = strtok(const_cast<char*>(input.substr(0, sep1).c_str()), ",");
        while (token) {
            arrivals.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        token = strtok(const_cast<char*>(input.substr(sep1 + 1, sep2 - (sep1 + 1)).c_str()), ",");
        while (token) {
            bursts.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        token = strtok(const_cast<char*>(input.substr(sep2 + 1).c_str()), ",");
        while (token) {
            priorities.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        auto results = calculatePriority(arrivals, bursts, priorities);
        
        for (const auto& p : results) {
            cout << p.id << ","
                 << p.arrivalTime << ","
                 << p.burstTime << ","
                 << p.priority << ","
                 << p.completionTime << ","
                 << p.turnaroundTime << ","
                 << p.waitingTime << "|";
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
        vector<int> priorities = {3, 1, 4, 2}; 
        
        auto results = calculatePriority(arrivals, bursts, priorities);
        
        cout << "PID\tArrival\tBurst\tPriority\tCompletion\tTurnaround\tWaiting\n";
        for (const auto& p : results) {
            cout << p.id << "\t" << p.arrivalTime << "\t" << p.burstTime << "\t"
                 << p.priority << "\t\t" << p.completionTime << "\t\t" 
                 << p.turnaroundTime << "\t\t" << p.waitingTime << "\n";
        }
    }
    return 0;
}