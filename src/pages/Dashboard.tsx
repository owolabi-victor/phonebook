// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { PersonForm } from '../components/PersonForm'
import { FilteredPersons } from '../components/filter'
import PhoneBookService from '../services/phoneBook'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

type ButtonProps = {
  text: string
  type?: 'button' | 'submit'
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export type Person = {
  name: string
  number: string
  id: string | number
}

export const Button = ({
  type = 'button',
  text,
  onClick,
  variant = 'primary',
  size = 'md',
}: ButtonProps) => {
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95'

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-400',
    danger:
      'bg-red-500 hover:bg-red-600 text-white shadow-sm focus:ring-red-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {text}
    </button>
  )
}

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [persons, setPersons] = useState<Person[]>([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  console.log('🐛 persons state:', persons, 'type:', typeof persons, 'isArray:', Array.isArray(persons))

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 4
  const [totalPages, setTotalPages] = useState(1)

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    if (!user) return

    console.log('🔄 Fetching contacts for page:', page)

    PhoneBookService.getAll(page, limit)
      .then((resp) => {
        console.log('✅ API Success:', resp)
        // Ensure we always set an array
        setPersons(Array.isArray(resp.data) ? resp.data : [])
        setTotalPages(resp.totalPages || 1)
      })
      .catch((err) => {
        console.error('❌ API Failed:', err)
        // CRITICAL: Always reset to empty array on error
        setPersons([])

        if (err.response?.status === 401) {
          logout()
          navigate('/login')
        } else {
          showNotification('Failed to load contacts')
        }
      })
  }, [user, page, logout, navigate])

  const addNewObjects = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = newName.trim()
    if (!trimmedName || !newNumber) return

    if (/\d/.test(trimmedName)) {
      alert('Name cannot contain numbers')
      return
    }
    if (!/^\d+$/.test(newNumber)) {
      alert('Number must contain only digits')
      return
    }

    const exists = (persons || []).some(
      (p) =>
        p.name.toLowerCase() === trimmedName.toLowerCase() &&
    p.number === newNumber
    )
    if (exists) {
      alert(`${trimmedName} is already in your phonebook`)
      return
    }

    const newEntry = { name: trimmedName, number: newNumber }

    PhoneBookService.create(newEntry)
      .then((returned) => {
        setPersons((prev) => [...prev, returned])
        setNewName('')
        setNewNumber('')
        showNotification(`${returned.name} was added`)
        if ((persons || []).length + 1 > limit) setPage((p) => p + 1)
      })
      .catch((err) => {
        showNotification(err.response?.data?.error || 'Failed to add')
      })
  }

  const handleUpdate = (id: string | number, updated: Person) => {
    PhoneBookService.update(id, updated)
      .then((returned) => {
        setPersons((prev) =>
          prev.map((p) => (p.id === id ? returned : p))
        )
        showNotification(`${returned.name}'s number updated`)
      })
      .catch(() => showNotification('Update failed'))
  }

  const handleDelete = (id: string | number) => {
    const person = persons.find((p) => p.id === id)
    if (!person) return
    if (!window.confirm(`Delete ${person.name}?`)) return

    PhoneBookService.remove(id)
      .then(() => {
        setPersons((prev) => prev.filter((p) => p.id !== id))
        showNotification(`${person.name} deleted`)
      })
      .catch(() => showNotification('Delete failed'))
  }

  const handleUpdatePrompt = (id: string | number) => {
    const person = persons.find((p) => p.id === id)
    if (!person) return
    const newNum = prompt(`Update number for ${person.name}:`, person.number)
    if (!newNum || newNum === person.number) return
    if (!/^\d+$/.test(newNum)) return alert('Invalid number')
    if (persons.some((p) => p.number === newNum && p.id !== id))
      return alert('Number already used')

    if (window.confirm(`Change ${person.name}'s number to ${newNum}?`)) {
      handleUpdate(id, { ...person, number: newNum })
    }
  }

  const filtered = (persons || []).filter((p) =>
    search
      ? `${p.name} ${p.number}`.toLowerCase().includes(search.toLowerCase())
      : true
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">📱</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Phonebook</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="px-4 py-6 sm:px-6 max-w-md mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium">{notification}</span>
            </div>
          </div>
        )}

        {/* User + Logout */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Welcome, <strong>{user?.username ?? 'Guest'}</strong>!
          </h2>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-gray-500">🔍</span>
            <h2 className="text-lg font-semibold text-gray-900">Search Contacts</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Add Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-gray-500">➕</span>
            <h2 className="text-lg font-semibold text-gray-900">Add New Contact</h2>
          </div>
          <PersonForm
            newName={newName}
            setNewName={setNewName}
            newNumber={newNumber}
            setNewNumber={setNewNumber}
            onSubmit={addNewObjects}
          />
        </div>

        {/* Export & Import Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Export / Import</h2>

          <div className="flex flex-wrap gap-2">
            {/* Download CSV */}
            <button
              onClick={async () => {
                const token = localStorage.getItem('token')
                if (!token) return alert('Please log in first')

                try {
                  const res = await fetch('http://localhost:3001/api/persons/export', {
                    headers: { Authorization: `Bearer ${token}` }
                  })

                  if (!res.ok) {
                    const err = await res.json()
                    return alert(err.error || 'Export failed')
                  }

                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `contacts_${user?.username}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                } catch {
                  alert('Network error')
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Download CSV
            </button>

            {/* Email CSV */}
            <button
              onClick={async () => {
                const email = prompt('Send contacts to:')
                if (!email) return
                const token = localStorage.getItem('token')
                if (!token) return alert('Please log in')

                try {
                  const res = await fetch('http://localhost:3001/api/persons/export/email', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ email })
                  })
                  const data = await res.json()
                  alert(data.message || data.error)
                } catch {
                  alert('Network error')
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Email CSV
            </button>

            {/* Import CSV */}
            {/* <label className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition">
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('csv', file)
                  const token = localStorage.getItem('token')
                  if (!token) return alert('Please log in')

                  try {
                    const res = await fetch('http://localhost:3001/api/persons/import', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData
                    })
                    const data = await res.json()
                    alert(data.message || data.error)
                    window.location.reload()
                  } catch {
                    alert('Network error')
                  }
                }}
              />
            </label> */}
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">👥</span>
                <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
              </div>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {filtered.length}
              </span>
            </div>
          </div>

          <div className="p-4">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {search ? 'No matches' : 'Your phonebook is empty'}
              </p>
            ) : (
              <FilteredPersons
                persons={filtered}
                search={search}
                onEdit={handleUpdatePrompt}
                handleDelete={handleDelete}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}