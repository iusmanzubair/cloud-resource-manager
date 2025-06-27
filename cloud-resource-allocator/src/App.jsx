import { useState } from 'react';
import { scheduleJobs } from './utils/scheduleJobs';
import { detectDeadlocks } from './utils/deadlockDetector';
import ResourcePanel from './components/ResourcePanel';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultsDisplay from './components/ResultsDisplay';
import JobForm from './components/JobForm';
import { calculateFcfsMetrics } from "./utils/calculateFcfsMetrics"

function App() {
  const [selectedCPUAlgo, setSelectedCPUAlgo] = useState('FCFS');
  const [selectedDeadlockAlgo, setSelectedDeadlockAlgo] = useState("Banker's Algorithm");
  const [jobQueue, setJobQueue] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  // const [completedJobs, setCompletedJobs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [results, setResults] = useState(null);
  const [deadlockStatus, setDeadlockStatus] = useState(null);
  const [fcfsResults, setFcfsResults] = useState(null);
  
  const [resources, setResources] = useState({
    cpu: { instances: 4, available: 4 },
    disk: { instances: 10, available: 10 },
    memory: { instances: 16, available: 16 }
  });

  const processJobs = async () => {
    if (jobQueue.length === 0) return;
    
    setIsProcessing(true);
    const scheduledJobs = scheduleJobs([...jobQueue], selectedCPUAlgo);
    
    // For FCFS, calculate and store detailed metrics
    if (selectedCPUAlgo === 'FCFS') {
      const fcfsMetrics = await calculateFcfsMetrics([...scheduledJobs]);
      console.log(fcfsMetrics);
      setFcfsResults(fcfsMetrics);
    }
    
    for (const job of scheduledJobs) {
      // Check for deadlocks before allocating resources
      const deadlockCheck = detectDeadlocks(
        [...activeJobs, job],
        resources,
        selectedDeadlockAlgo
      );
      
      if (deadlockCheck.isDeadlock) {
        setDeadlockStatus({
          message: `Deadlock detected for Job #${job.id}! ${deadlockCheck.message}`,
          isError: true
        });
        continue; // Skip this job
      } else {
        setDeadlockStatus({
          message: "No deadlock detected",
          isError: false
        });
      }

      // Allocate resources
      setActiveJobs(prev => [...prev, {...job, status: 'processing'}]);
      setResources(prev => ({
        cpu: { ...prev.cpu, available: prev.cpu.available - job.cpu },
        disk: { ...prev.disk, available: prev.disk.available - job.disk },
        memory: { ...prev.memory, available: prev.memory.available - job.memory }
      }));
      
      // Simulate processing with actual delay based on burst time
      await new Promise(resolve => setTimeout(resolve, job.burstTime * 1000));
      
      // Free resources
      setResources(prev => ({
        cpu: { ...prev.cpu, available: prev.cpu.available + job.cpu },
        disk: { ...prev.disk, available: prev.disk.available + job.disk },
        memory: { ...prev.memory, available: prev.memory.available + job.memory }
      }));
      
      // Move job to completed
      setActiveJobs(prev => prev.filter(j => j.id !== job.id));
      // setCompletedJobs(prev => [...prev, {...job, status: 'completed'}]);
    }
    
    // calculateMetrics();
    setJobQueue([]);
    setIsProcessing(false);
  };

  // const calculateMetrics = () => {
  //   if (completedJobs.length === 0) return;
    
  //   const totalTurnaround = completedJobs.reduce((sum, job) => sum + job.burstTime, 0);
  //   const avgTurnaround = totalTurnaround / completedJobs.length;
    
  //   setResults({
  //     avgTurnaroundTime: avgTurnaround.toFixed(2),
  //     throughput: (completedJobs.length / totalTurnaround).toFixed(2),
  //     jobsCompleted: completedJobs.length
  //   });
  // };

  const handleJobSubmit = (newJob) => {
    const jobWithId = {
      ...newJob,
      id: jobQueue.length + 1,
      status: 'queued',
      arrivalTime: newJob.arrivalTime || 0
    };
    setJobQueue([...jobQueue, jobWithId]);
  };

  const handleClearQueue = () => {
    setJobQueue([]);
    setDeadlockStatus(null);
    setFcfsResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Cloud Resource Manager</h1>
        <p className="text-gray-600">Efficient allocation of cloud resources</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ResourcePanel 
            resources={resources} 
            activeJobs={activeJobs} 
            queueLength={jobQueue.length} 
          />
          
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
                title="Deadlock Detection"
                algorithms={["Banker's Algorithm", "Resource Allocation Graph"]}
                selected={selectedDeadlockAlgo}
                onChange={setSelectedDeadlockAlgo}
                disabled={isProcessing}
              />
            </div>
          </div>

          <JobForm
            onSubmit={handleJobSubmit} 
            disabled={isProcessing}
            queueLength={jobQueue.length}
          />
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Queue Controls</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearQueue}
                  disabled={isProcessing || jobQueue.length === 0}
                  className={`px-4 py-2 text-sm rounded-md ${isProcessing || jobQueue.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                  Clear Queue
                </button>
                <button
                  onClick={processJobs}
                  disabled={isProcessing || jobQueue.length === 0}
                  className={`px-4 py-2 text-sm rounded-md ${isProcessing || jobQueue.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {isProcessing ? 'Processing...' : 'Run Scheduler'}
                </button>
              </div>
            </div>
            
            {deadlockStatus && (
              <div className={`mt-3 p-3 rounded-md ${deadlockStatus.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {deadlockStatus.message}
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              {jobQueue.length} jobs in queue | CPU Algorithm: {selectedCPUAlgo} | Deadlock: {selectedDeadlockAlgo}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* <ResultsDisplay results={results} /> */}
          
          {/* FCFS Results Table - Only shown when FCFS is selected and has results */}
          {selectedCPUAlgo === 'FCFS' && fcfsResults && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">FCFS Scheduling Details</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg Turnaround Time</h3>
                  <p className="text-2xl font-semibold">{fcfsResults.avgTurnaroundTime.toFixed(2)}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg Waiting Time</h3>
                  <p className="text-2xl font-semibold">{fcfsResults.avgWaitingTime.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnaround</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiting</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fcfsResults.jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P{job.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.arrivalTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.burstTime}</td>
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
          <p className="text-sm text-gray-600">
            Arrival: {job.arrivalTime}s | Burst: {job.burstTime}s
          </p>
          <p className="text-sm text-gray-600">
            CPU: {job.cpu}, Disk: {job.disk}GB, Memory: {job.memory}GB
          </p>
          {job.priority && (
            <p className="text-sm text-gray-600">Priority: {job.priority}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default App;