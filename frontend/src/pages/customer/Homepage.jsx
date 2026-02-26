import { DashboardLayout } from "@/components/common/DashboardLayout";

const stats = [
  { label: "Upcoming Appointments", value: 3 },
  { label: "Total Orders", value: 12 },
  { label: "Hours Booked", value: 28 },
  { label: "Loyalty Points", value: 450 },
];

const recentBookings = [
  { service: "Hair Coloring", date: "Feb 20, 2026", status: "Confirmed" },
  { service: "Facial Treatment", date: "Feb 18, 2026", status: "Completed" },
  { service: "Manicure & Pedicure", date: "Feb 14, 2026", status: "Completed" },
];

export default function Homepage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your account.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-gray-300 p-4">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-300 p-4">
            <h2 className="font-bold mb-3">Recent Bookings</h2>
            <div>
              {recentBookings.map((booking) => (
                <div
                  key={`${booking.service}-${booking.date}`}
                  className="py-2 border-b border-gray-200 last:border-0"
                >
                  <p className="font-medium">{booking.service}</p>
                  <p className="text-sm text-gray-600">
                    {booking.date} - {booking.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-4">
            <h2 className="font-bold mb-3">Quick Actions</h2>
            <div>
              <button className="block w-full text-left py-2 border-b border-gray-200 hover:bg-gray-50">
                Book New Appointment
              </button>
              <button className="block w-full text-left py-2 border-b border-gray-200 hover:bg-gray-50">
                Update Profile
              </button>
              <button className="block w-full text-left py-2 hover:bg-gray-50">
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


