export default function EmergencyContactsForm() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold">Emergency Contacts</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded-md border p-2" placeholder="Contact name" />
        <input className="rounded-md border p-2" placeholder="Relationship" />
        <input className="rounded-md border p-2" placeholder="Phone" />
        <input className="rounded-md border p-2" placeholder="Email" />
        <input className="rounded-md border p-2" placeholder="Backup contact name" />
        <input className="rounded-md border p-2" placeholder="Backup phone" />
      </div>

      <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">
        Save Emergency Contacts
      </button>
    </div>
  );
}