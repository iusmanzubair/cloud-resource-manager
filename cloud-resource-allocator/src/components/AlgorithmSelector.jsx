export default function AlgorithmSelector({ title, algorithms, selected, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
      >
        {algorithms.map((algo) => (
          <option key={algo} value={algo}>{algo}</option>
        ))}
      </select>
    </div>
  );
}