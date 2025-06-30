export default function StorageForm({ title, storedJobs, selected, onChange }) {
  return (
    <div className="space-y-2">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Access Page
        </h2>
        <form onSubmit={() => {}} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {title}
              </label>
              <select
                value={selected}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                {storedJobs.map((algo) => (
                  <option key={algo} value={algo}>
                    {algo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!title}
                className={`w-36 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !title ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
