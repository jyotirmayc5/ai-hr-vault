export default function CompensationForm() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold">Compensation</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded-md border p-2" placeholder="Base salary" />
        <input className="rounded-md border p-2" placeholder="Pay frequency" />
        <input className="rounded-md border p-2" placeholder="Pay type" />
        <input className="rounded-md border p-2" placeholder="Bonus target" />
        <input className="rounded-md border p-2" placeholder="Benefits plan" />
        <input className="rounded-md border p-2" type="date" />
      </div>

      <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">
        Save Compensation
      </button>
    </div>
  );
}