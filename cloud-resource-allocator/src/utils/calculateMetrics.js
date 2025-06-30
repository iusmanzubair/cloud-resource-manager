export const calculateMetrics = async (jobs, algo) => {
  try {
    const response = await fetch(`http://localhost:4000/api/${algo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arrivals: jobs.map((j) => j.arrivalTime),
        bursts: jobs.map((j) => j.burstTime),
        priorities: jobs.map((j) => j.priority),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      jobs: data.processes,
      avgTurnaroundTime: data.avgTurnaroundTime,
      avgWaitingTime: data.avgWaitingTime,
      throughput: data.throughput,
    };
  } catch (error) {
    console.error("API Error:", error);
  }
};       