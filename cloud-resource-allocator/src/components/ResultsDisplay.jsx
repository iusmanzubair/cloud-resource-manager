export default function ResultsDisplay({ results }) {
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance Metrics</h2>
        <p className="text-gray-500">No jobs completed yet</p>
      </div>
    );
  }

  try {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance Metrics</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Average Turnaround Time:</span>
            <span className="font-medium">{results.avgTurnaroundTime || 'N/A'}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Throughput:</span>
            <span className="font-medium">{results.throughput || 'N/A'} jobs/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jobs Completed:</span>
            <span className="font-medium">{results.jobsCompleted || 0}</span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ResultsDisplay:", error);
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance Metrics</h2>
        <p className="text-red-500">Error displaying metrics</p>
      </div>
    );
  }
}