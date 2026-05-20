import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import API_URL from "../config"

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [editUser, setEditUser] = useState(null)
  const [editName, setEditName] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 3

  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) navigate("/login")
  }, [token, navigate])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(res.data)
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users")
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(users.filter((user) => user._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user")
    }
  }

  const handleEdit = (user) => {
    setEditUser(user._id)
    setEditName(user.name)
  }

  const handleUpdate = async (id) => {
    try {
      const res = await axios.put(
        `${API_URL}/users/${id}`,
        { name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(users.map(u => u._id === id ? res.data.data : u))
      setEditUser(null)
      setEditName("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users List</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={handleSearch}
          className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:border-blue-500 bg-white"
        />

        {error && <p className="mb-4 text-center text-sm text-red-600">{error}</p>}

        <div className="grid gap-4">
          {paginatedUsers.map((user) => (
            <div key={user._id} className="bg-white p-4 rounded-lg shadow">
              {editUser === user._id ? (
                <div className="flex gap-2 items-center">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border rounded-lg p-2 flex-1 focus:outline-none focus:border-blue-500"
                  />
                  <button onClick={() => handleUpdate(user._id)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Save</button>
                  <button onClick={() => setEditUser(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500">No users found!</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 hover:bg-gray-50"
            >Previous</button>
            <span className="px-4 py-2 bg-white rounded-lg shadow">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 hover:bg-gray-50"
            >Next</button>
          </div>
        )}
      </div>
    </div>
  )
}