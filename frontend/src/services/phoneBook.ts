//phoneBook.ts
import axios from 'axios'
import type { Person } from '../App'

// Use environment variable for API URL
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/persons'

const generateId = (): number => {
  return Math.floor(Math.random() * 1000000) + 1
}

const getAll = async (): Promise<Person[]> => {
  const request = axios.get<Person[]>(baseUrl)
  const response = await request
  return response.data
}

const create = async (newObject: Omit<Person, 'id'>): Promise<Person> => {
    const personWithId = {
    ...newObject,
    id: generateId()
  }
  
  console.log('Creating person with generated ID:', personWithId)

  console.log(newObject)
  const request = axios.post<Person>(baseUrl, personWithId)
  const res = await request
  return res.data
}

const update = async (id: number, newObject: Person): Promise<Person> => {
  const request =  axios.put<Person>(`${baseUrl}/${id}`, newObject)
  const res = await request
  return res.data
}

const remove = async (id: number): Promise<void> => {
  const url = `${baseUrl}/${id}`;
  console.log('DELETE request to:', url); 
  await axios.delete(url);};

const PhoneBookService = {
  getAll,
  create,
  update,
  remove, 
};


export default PhoneBookService;