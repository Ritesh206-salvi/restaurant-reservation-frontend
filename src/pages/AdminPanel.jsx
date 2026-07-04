import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations/admin/all');
      setReservations(res.data.reservations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDate = async () => {
    if (!filterDate) {
      fetchAllReservations();
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/reservations/admin/by-date?date=${filterDate}`);
      setReservations(res.data.reservations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/admin/${id}`);
      fetchAllReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      {/* Navbar */}
      <nav className="bg-slate-800 shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 All Reservations</h2>

          {/* Filter */}
          <div className="flex gap-3 mb-6">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <button
              onClick={handleFilterByDate}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
            >
              Filter
            </button>
            <button
              onClick={() => { setFilterDate(''); fetchAllReservations(); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>

          {/* Reservations Table */}
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : reservations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reservations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-600 text-sm">
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Table</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Time</th>
                    <th className="py-3 px-2">Guests</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-800">{r.user?.name}</p>
                        <p className="text-xs text-gray-500">{r.user?.email}</p>
                      </td>
                      <td className="py-3 px-2">Table {r.table?.tableNumber}</td>
                      <td className="py-3 px-2">{r.date}</td>
                      <td className="py-3 px-2">{r.timeSlot}</td>
                      <td className="py-3 px-2">{r.guests}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {r.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(r._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}