import { useRef, useState } from 'react';
import AlgorithmSelector from './components/AlgorithmSelector';
import JobForm from './components/JobForm';
import ResourcePanel from './components/ResourcePanel';
import { calculateMetrics } from './utils/calculateMetrics';
import StorageForm from './components/StorageForm';
import { calculatePagesHitsAndFaults } from './utils/calculatePageHitsAndFaults';

const RAM_SLOTS = 4;

function App() {
  const [id, setId] = useState(1);
  const [selectedCPUAlgo, setSelectedCPUAlgo] = useState('FCFS');
  const [selectedPageAlgo, setSelectedPageAlgo] = useState("FIFO");
  const [jobQueue, setJobQueue] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [pageResults, setPageResults] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [storedJobs, setStoredJobs] = useState([]);
  const [memoryPages, setMemoryPages] = useState([]);
  const [allPages, setAllPages] = useState([]);
  
  const [resources, setResources] = useState({
    cpu: { instances: 4, available: 4 },
    disk: { instances: 64, available: 64 },
    memory: { instances: 16, available: 16 }
  });

  const processJobs = async () => {
    if (jobQueue.length === 0) return;
    
    setIsProcessing(true);
    
    for (const job of jobQueue) {
      setActiveJobs(prev => [...prev, {...job, status: 'processing'}]);
      setResources(prev => ({
        cpu: { ...prev.cpu, available: prev.cpu.available - job.cpu },
        disk: { ...prev.disk, available: prev.disk.available - job.disk },
        memory: { ...prev.memory, available: prev.memory.available - job.memory }
      }));
      
      await new Promise(resolve => setTimeout(resolve, job.burstTime * 1000)).then(async () => {
        const metrics = await calculateMetrics(jobQueue, selectedCPUAlgo.toLowerCase().replaceAll(" ", ""));
        setResults(metrics);
      });

      setResources(prev => ({
        cpu: { ...prev.cpu, available: prev.cpu.available + job.cpu },
        disk: { ...prev.disk, available: prev.disk.available },
        memory: { ...prev.memory, available: prev.memory.available + job.memory }
      }));
      
      if(job.disk > 0)
        setStoredJobs(prev => [...prev, job.id])
      setActiveJobs(prev => prev.filter(j => j.id !== job.id));
    }
    
    setJobQueue([]);
    setIsProcessing(false);
  };

  const handleJobSubmit = (newJob) => {
    const jobWithId = {
      ...newJob,
      id: id,
      status: 'queued',
    };

    setId(prev => prev + 1);
    setJobQueue([...jobQueue, jobWithId]);
  };

  const fifoIndex = useRef(0);
  const lruRef = useRef(new Map());
  const handlePageSubmit = (id) => {

    setAllPages(prev => [...prev, id]);

    setMemoryPages(prev => {
      if(selectedCPUAlgo === "FIFO") {
        if(prev.includes(id))
          return prev;

        if(prev.length < RAM_SLOTS)
          return [...prev, id] 

        const newPages = [...prev];
        const index = fifoIndex.current % RAM_SLOTS;
        newPages[index] = id;

        fifoIndex.current += 1;
        return newPages;
      }
      else {
        if (prev.includes(id)) {
          lruRef.current.set(id, Date.now());
          return prev; 
        }

        if (prev.length < RAM_SLOTS) {
          lruRef.current.set(id, Date.now());
          return [...prev, id];
        }

        let lruPage = prev[0];
        let minTime = lruRef.current.get(lruPage);
    
        for (const page of prev) {
          const time = lruRef.current.get(page);
          if (time < minTime) {
            minTime = time;
            lruPage = page;
          }
        }

        const newPages = prev.map(p => p === lruPage ? id : p);
        lruRef.current.delete(lruPage);
        lruRef.current.set(id, Date.now());
    
        return newPages;
      }
    })
  }

  const handleClearQueue = () => {
    setJobQueue([]);
    setResults(null);
  };

  const handlePageHitsAndFaults = async () => {
    const _pageResults = await calculatePagesHitsAndFaults(allPages, RAM_SLOTS, selectedPageAlgo.toLowerCase());
    setPageResults(_pageResults);
    console.log(pageResults)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Cloud Resource Manager</h1>
        <p className="text-gray-600">Efficient allocation of cloud resources</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ResourcePanel resources={resources} activeJobs={activeJobs} queueLength={jobQueue.length} storedJobs={storedJobs} />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Algorithm Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AlgorithmSelector 
                title="CPU Scheduler"
                algorithms={['FCFS', 'SJF', 'SRTF', 'Priority', 'Round Robin']}
                selected={selectedCPUAlgo}
                onChange={setSelectedCPUAlgo}
                disabled={isProcessing}
              />
              <AlgorithmSelector 
                title="Page Replacement Algorithm"
                algorithms={["FIFO", "LRU"]}
                selected={selectedPageAlgo}
                onChange={setSelectedPageAlgo}
                disabled={isProcessing}
              />
            </div>
          </div>

          <JobForm onSubmit={handleJobSubmit} disabled={isProcessing} queueLength={jobQueue.length} />

          <StorageForm storedJobs={storedJobs} onSubmit={handlePageSubmit} />

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Queue Controls</h2>
              <div className="flex space-x-2">
                <button onClick={handleClearQueue} disabled={isProcessing || jobQueue.length === 0} className={`px-4 py-2 text-sm rounded-md ${isProcessing || jobQueue.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`} >Clear Queue</button>
                <button onClick={processJobs} disabled={isProcessing || jobQueue.length === 0} className={`px-4 py-2 text-sm rounded-md ${isProcessing || jobQueue.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`} >{isProcessing ? 'Processing...' : 'Run Scheduler'}</button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">{jobQueue.length} jobs in queue | CPU Algorithm: {selectedCPUAlgo} | Page Replacement Algorithm: {selectedPageAlgo}</p>
          </div>
        </div>

        <div className="space-y-6">
          {results && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{selectedCPUAlgo} Scheduling Details</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg Turnaround Time</h3>
                  <p className="text-2xl font-semibold">{results.avgTurnaroundTime.toFixed(2)}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg Waiting Time</h3>
                  <p className="text-2xl font-semibold">{results.avgWaitingTime.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst</th>
                      {selectedCPUAlgo === "Priority" && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnaround</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiting</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P{job.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.arrivalTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.burstTime}</td>
                        {selectedCPUAlgo === "Priority" && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.priority}</td>}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.completionTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.turnaroundTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.waitingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Job Queue ({jobQueue.length})</h2>
            {jobQueue.length === 0 ? (
              <p className="text-gray-500">No jobs in queue</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {jobQueue.map((job) => (
                  <JobItem key={job.id} job={job} status="queued" />
                ))}
              </div>
            )}
            
            <h2 className="text-xl font-semibold mb-4 mt-6 text-gray-800">Active Jobs ({activeJobs.length})</h2>
            {activeJobs.length === 0 ? (
              <p className="text-gray-500">No active jobs</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activeJobs.map((job) => (
                  <JobItem key={job.id} job={job} status="processing" />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Disk Storage</h3>
        
        {storedJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Storage is currently empty
          </div>
        ) : (
          <div className="flex flex-col items-center">
            
            <div className="w-full flex flex-wrap justify-center gap-2">
              {storedJobs.map((item, index) => (
                <div
                  key={index}
                  className={`relative p-4 border rounded-lg shadow-sm w-24 h-24 flex items-center justify-center transition-all bg-blue-50 border-blue-200`}
                >
                  <span className="font-medium text-gray-800">{item}</span>
                  <span className="absolute bottom-1 right-1 text-xs text-gray-500">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Memory</h3>
        
        {memoryPages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Memory is currently empty
          </div>
        ) : (
          <div className="flex flex-col items-center">
            
            <div className="w-full flex flex-wrap justify-center gap-2">
              {memoryPages.map((item, index) => (
                <div
                  key={index}
                  className={`relative p-4 border rounded-lg shadow-sm w-24 h-24 flex items-center justify-center transition-all bg-blue-50 border-blue-200`}
                >
                  <span className="font-medium text-gray-800">{item}</span>
                  <span className="absolute bottom-1 right-1 text-xs text-gray-500">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={handlePageHitsAndFaults} className={`px-4 py-2 text-sm rounded-md text-blue-600 underline mt-6`} >Page Hits/Faults</button>
        {pageResults && <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm text-green-800">Page Hits</p>
            <p className="text-2xl font-bold">{pageResults.pageHits}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-800">Page Faults</p>
            <p className="text-2xl font-bold">{pageResults.pageFaults}</p>
          </div>
        </div>
}
      </div>
        </div>
      </div>
    </div>
  );
}

function JobItem({ job, status }) {
  const statusColors = {
    queued: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };
  
  return (
    <div className="border rounded p-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">Job #{job.id}</p>
          <p className="text-sm text-gray-600">Arrival: {job.arrivalTime}s | Burst: {job.burstTime}s</p>
          <p className="text-sm text-gray-600">CPU: {job.cpu}, Disk: {job.disk}GB, Memory: {job.memory}GB</p>
          {job.priority && ( <p className="text-sm text-gray-600">Priority: {job.priority}</p> )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>{status}</span>
      </div>
    </div>
  );
}

export default App;