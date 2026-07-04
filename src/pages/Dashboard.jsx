import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({ tableId: '', date: '', timeSlot: '', guests: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['12:00-13:00', '13:00-14:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'];

  useEffect(() => {
    fetchTables();
    fetchMyReservations();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.tables);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data.reservations);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/reservations', formData);
      setSuccess('Reservation created successfully!');
      setFormData({ tableId: '', date: '', timeSlot: '', guests: '' });
      fetchMyReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      fetchMyReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-xl font-bold text-gray-800">Table Reserve</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Book a Table</h2>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1">Select Table</label>
              <select
                name="tableId"
                value={formData.tableId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">-- Choose a table --</option>
                {tables.map((t) => (
                  <option key={t._id} value={t._id}>
                    Table {t.tableNumber} (Seats {t.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Time Slot</label>
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">-- Choose time --</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Number of Guests</label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. 4"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Reserve Table'}
            </button>
          </form>
        </div>

        {/* My Reservations */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 My Reservations</h2>

          {reservations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reservations yet. Book your first table!</p>
          ) : (
            <div className="space-y-3">
              {reservations.map((r) => (
                <div
                  key={r._id}
                  className={`p-4 rounded-lg border ${
                    r.status === 'cancelled' ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Table {r.table?.tableNumber} — {r.guests} guests
                      </p>
                      <p className="text-sm text-gray-600">📅 {r.date} | ⏰ {r.timeSlot}</p>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                          r.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(r._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}