import api from './axios'

export const getUsers = async (page = 1, limit = 10) => {
  const res = await api.get(`/admin/users?page=${page}&limit=${limit}`)
  return res.data
}
