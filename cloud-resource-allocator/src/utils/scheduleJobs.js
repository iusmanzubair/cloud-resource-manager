export function scheduleJobs(jobs, algorithm) {
  switch (algorithm) {
    case 'FCFS':
      return [...jobs].sort((a, b) => a.arrivalTime - b.arrivalTime);
      
    case 'SJF':
      return [...jobs].sort((a, b) => a.burstTime - b.burstTime);
      
    case 'SRTF':
      // For SRTF we'd need to implement preemption, but this is simplified
      return [...jobs].sort((a, b) => a.burstTime - b.burstTime);
      
    case 'Priority':
      return [...jobs].sort((a, b) => a.priority - b.priority);
      
    case 'Round Robin':
      // For RR we'd need to implement time slicing, but this is simplified
      return [...jobs];
      
    default:
      return jobs;
  }
}