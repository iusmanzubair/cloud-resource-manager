export default function ResourcePanel({ resources, activeJobs, queueLength, storedJobs }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Resource Allocation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResourceCard 
          title="CPU Instances" 
          total={resources.cpu.instances} 
          used={resources.cpu.instances - resources.cpu.available} 
          color="blue"
          activeJobs={activeJobs.filter(j => j.cpu > 0).length}
          queueLength={queueLength}
          storedJobsLength={storedJobs.length}
        />
        <ResourceCard 
          title="Disk Storage (GB)" 
          total={resources.disk.instances} 
          used={resources.disk.instances - resources.disk.available} 
          color="green"
          activeJobs={activeJobs.filter(j => j.disk > 0).length}
          queueLength={queueLength}
          storedJobsLength={storedJobs.length}
        />
        <ResourceCard 
          title="Memory (GB)" 
          total={resources.memory.instances} 
          used={resources.memory.instances - resources.memory.available} 
          color="purple"
          activeJobs={activeJobs.filter(j => j.memory > 0).length}
          queueLength={queueLength}
          storedJobsLength={storedJobs.length}
        />
      </div>
    </div>
  );
}

function ResourceCard({ title, total, used, color, activeJobs, queueLength, storedJobsLength }) {
  const percentage = (used / total) * 100;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-gray-700">{title}</h3>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-500">Used: {used}/{total}</span>
        <span className="text-gray-500">Active: {activeJobs}</span>
      </div>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% utilized</p>
        {color === "green" && <p className="text-xs text-gray-500">{storedJobsLength} Items stored</p>}
        {queueLength > 0 && (
          <p className="text-xs text-gray-500">{queueLength} in queue</p>
        )}
      </div>
    </div>
  );
}