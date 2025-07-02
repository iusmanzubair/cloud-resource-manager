#include <iostream>
#include <vector>
#include <queue>
#include <unordered_set>
#include <fstream>
#include <string>
#include <cstring>

using namespace std;

struct PageResult {
    int pageHits;
    int pageFaults;
};

PageResult calculateFIFO(int ramSlots, const vector<int>& diskPages) {
    queue<int> pageQueue;
    unordered_set<int> pageSet;
    int hits = 0;
    int faults = 0;

    for (int page : diskPages) {
        if (pageSet.find(page) != pageSet.end()) {
            ++hits;
            continue;
        }

        ++faults;
        
        if (pageQueue.size() == ramSlots) {
            int oldest = pageQueue.front();
            pageQueue.pop();
            pageSet.erase(oldest);
        }

        pageSet.insert(page);
        pageQueue.push(page);
    }

    return {hits, faults};
}

void runAsService() {
    string input;
    while (getline(cin, input)) {
        size_t sep = input.find(';');
        int ramSlots = stoi(input.substr(0, sep));
        
        vector<int> diskPages;
        
        string pages_str = input.substr(sep + 1);
        char* token = strtok(const_cast<char*>(pages_str.c_str()), ",");
        while (token) {
            diskPages.push_back(stoi(token));
            token = strtok(nullptr, ",");
        }
        
        auto result = calculateFIFO(ramSlots, diskPages);
        
        cout << result.pageHits << "," << result.pageFaults << endl;
    }
}

int main(int argc, char* argv[]) {
    if (argc > 1 && strcmp(argv[1], "--service") == 0) {
        runAsService();
    } else {
        vector<int> diskPages = {1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5};
        int ramSlots = 3;
        
        auto result = calculateFIFO(ramSlots, diskPages);
        
        cout << "FIFO Page Replacement Results:\n";
        cout << "Page Hits: " << result.pageHits << "\n";
        cout << "Page Faults: " << result.pageFaults << "\n";
    }
    return 0;
}