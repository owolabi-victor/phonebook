// src/services/phoneBook.ts
import axios from 'axios'
import type { Person } from '../App'

// ✅ Backend base URL
const baseUrl = import.meta.env.VITE_API_URL || '/api/persons'

// ✅ Add token to all requests
const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return {
    headers: { Authorization: `Bearer ${token}` }
  }
}

/* -------------------------------------------------- */
/* PAGINATED RESPONSE TYPE */
export type PaginatedResponse = {
  data: Person[];
  totalPages: number;
  page: number;
  limit: number;
  total: number;
}

/* -------------------------------------------------- */
/* GET ALL (paginated) */
const getAll = async (page = 1, limit = 4): Promise<PaginatedResponse> => {
  const res = await axios.get<PaginatedResponse>(
    `${baseUrl}?page=${page}&limit=${limit}`,
    getAuthConfig()
  )
  return res.data
}

/* -------------------------------------------------- */
/* CREATE */
const create = async (newObject: Omit<Person, 'id'>): Promise<Person> => {
  const res = await axios.post<Person>(baseUrl, newObject, getAuthConfig())
  return res.data
}

/* -------------------------------------------------- */
/* UPDATE */
const update = async (
  id: string | number,
  newObject: Partial<Person>
): Promise<Person> => {
  const res = await axios.put<Person>(
    `${baseUrl}/${id}`,
    newObject,
    getAuthConfig()
  )
  return res.data
}

/* -------------------------------------------------- */
/* DELETE */
const remove = async (id: string | number): Promise<void> => {
  await axios.delete(`${baseUrl}/${id}`, getAuthConfig())
}

/* -------------------------------------------------- */
export default { getAll, create, update, remove }
