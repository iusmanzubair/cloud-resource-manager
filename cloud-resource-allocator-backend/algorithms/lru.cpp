#include <iostream>
#include <vector>
#include <list>
#include <unordered_map>
#include <fstream>
#include <string>
#include <cstring>

using namespace std;

struct PageResult {
    int pageHits;
    int pageFaults;
};

PageResult calculateLRU(int ramSlots, const vector<int>& diskPages) {
    list<int> lruList;
    unordered_map<int, list<int>::iterator> pageMap;
    int hits = 0;
    int faults = 0;

    for (int page : diskPages) {
        if (pageMap.find(page) != pageMap.end()) {
            ++hits;
            lruList.erase(pageMap[page]);
            lruList.push_front(page);
            pageMap[page] = lruList.begin();
            continue;
        }

        ++faults;
        
        if (lruList.size() == ramSlots) {
            int lruPage = lruList.back();
            lruList.pop_back();
            pageMap.erase(lruPage);
        }

        lruList.push_front(page);
        pageMap[page] = lruList.begin();
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
        
        auto result = calculateLRU(ramSlots, diskPages);
        
        cout << result.pageHits << "," << result.pageFaults << endl;
    }
}

int main(int argc, char* argv[]) {
    if (argc > 1 && strcmp(argv[1], "--service") == 0) {
        runAsService();
    } else {
        vector<int> diskPages = {1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5};
        int ramSlots = 3;
        
        auto result = calculateLRU(ramSlots, diskPages);
        
        cout << "LRU Page Replacement Results:\n";
        cout << "Page Hits: " << result.pageHits << "\n";
        cout << "Page Faults: " << result.pageFaults << "\n";
    }
    return 0;
}