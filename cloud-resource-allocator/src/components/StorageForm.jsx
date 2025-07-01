import { useState } from 'react';

export default function StorageForm({storedJobs, onSubmit}) {
  const [selectedJob, setSelectedJob] = useState(storedJobs[0] || '');
  const [isDisabled, setIsDisabled] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDisabled(true);
    setSubmissionStatus('Submitting...');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitted job:', selectedJob);
      setSubmissionStatus(`Successfully submitted: ${selectedJob}`);
      setIsDisabled(false);
    }, 1500);

    onSubmit(selectedJob)
  };

  const handleJobChange = (job) => {
    setSelectedJob(job);
    setSubmissionStatus(''); // Clear status when selection changes
  };

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Job Access Page
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select a Job
              </label>
              <select
                value={selectedJob}
                onChange={(e) => handleJobChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value=""></option>
                {storedJobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isDisabled}
                className={`w-36 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isDisabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isDisabled ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          {submissionStatus && (
            <p className={`text-sm ${isDisabled ? 'text-gray-500' : 'text-green-600'}`}>
              {submissionStatus}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}