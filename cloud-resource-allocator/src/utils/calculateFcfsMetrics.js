export const calculateFcfsMetrics = async (jobs) => {
  try {
    const response = await fetch("http://localhost:4000/api/fcfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arrivals: jobs.map((j) => j.arrivalTime),
        bursts: jobs.map((j) => j.burstTime),
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