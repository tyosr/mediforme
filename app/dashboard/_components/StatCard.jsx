// app/dashboard/_components/StatCard.jsx
export default function StatCard({ title, value, color = "bg-blue-100" }) {
    return (
      <div className={`p-4 rounded shadow ${color}`}>
        <h3 className="text-md font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  }
  