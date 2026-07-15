export default function PersonalForm() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold">Personal Information</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded-md border p-2" placeholder="First name" />
        <input className="rounded-md border p-2" placeholder="Last name" />
        <input className="rounded-md border p-2" placeholder="Email" />
        <input className="rounded-md border p-2" placeholder="Phone" />
        <input className="rounded-md border p-2" placeholder="Address" />
        <input className="rounded-md border p-2" placeholder="City" />
        <input className="rounded-md border p-2" placeholder="State" />
        <input className="rounded-md border p-2" placeholder="Zip code" />
      </div>

      <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">
        Save Personal Information
      </button>
    </div>
  );
}