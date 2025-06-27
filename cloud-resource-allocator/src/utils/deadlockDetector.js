export function detectDeadlocks(jobs, resources, algorithm) {
  if (algorithm === "Banker's Algorithm") {
    return bankersAlgorithm(jobs, resources);
  } else {
    return resourceAllocationGraph(jobs, resources);
  }
}

function bankersAlgorithm(jobs, resources) {
  // Simplified Banker's algorithm implementation
  const available = {
    cpu: resources.cpu.available,
    disk: resources.disk.available,
    memory: resources.memory.available
  };

  // Check if any job's request exceeds available resources
  for (const job of jobs) {
    if (job.cpu > available.cpu || 
        job.disk > available.disk || 
        job.memory > available.memory) {
      return {
        isDeadlock: true,
        message: `Job #${job.id} cannot be allocated (insufficient resources)`
      };
    }
  }

  return { isDeadlock: false, message: "System is in safe state" };
}

function resourceAllocationGraph(jobs, resources) {
  // Simplified Resource Allocation Graph approach
  const allocated = {
    cpu: jobs.reduce((sum, job) => sum + job.cpu, 0),
    disk: jobs.reduce((sum, job) => sum + job.disk, 0),
    memory: jobs.reduce((sum, job) => sum + job.memory, 0)
  };

  // Check for circular wait conditions
  if (allocated.cpu >= resources.cpu.instances &&
      allocated.disk >= resources.disk.instances &&
      allocated.memory >= resources.memory.instances) {
    return {
      isDeadlock: true,
      message: "Circular wait detected - all resources allocated"
    };
  }

  return { isDeadlock: false, message: "No circular waits detected" };
}