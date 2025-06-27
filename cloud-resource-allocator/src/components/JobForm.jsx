import { useState } from 'react';

export default function JobForm({ onSubmit, disabled, queueLength }) {
  const [formData, setFormData] = useState({
    arrivalTime: 0,
    burstTime: 1,
    cpu: 1,
    disk: 1,
    memory: 1,
    priority: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      arrivalTime: 0,
      burstTime: 1,
      cpu: 1,
      disk: 1,
      memory: 1,
      priority: 1
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Submit New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
            <input
              type="number"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
              min="0"
              disabled={disabled}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Burst Time (seconds)</label>
            <input
              type="number"
              name="burstTime"
              value={formData.burstTime}
              onChange={handleChange}
              min="1"
              disabled={disabled}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPU Required</label>
            <input
              type="number"
              name="cpu"
              value={formData.cpu}
              onChange={handleChange}
              min="1"
              max="4"
              disabled={disabled}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Disk (GB)</label>
            <input
              type="number"
              name="disk"
              value={formData.disk}
              onChange={handleChange}
              min="1"
              max="10"
              disabled={disabled}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Memory (GB)</label>
            <input
              type="number"
              name="memory"
              value={formData.memory}
              onChange={handleChange}
              min="1"
              max="16"
              disabled={disabled}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority (1-10)</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              min="1"
              max="10"
              disabled={disabled}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={disabled}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {disabled ? 'Processing...' : `Add Job (${queueLength} in queue)`}
        </button>
      </form>
    </div>
  );
}