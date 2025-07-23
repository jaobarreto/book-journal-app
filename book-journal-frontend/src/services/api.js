import axios from 'axios'

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Funções para interagir com a API de livros
export const booksAPI = {
  // Buscar todos os livros
  getAll: () => api.get('/books'),

  // Buscar um livro específico
  getById: (id) => api.get(`/books/${id}`),

  // Criar um novo livro
  create: (bookData) => api.post('/books', bookData),

  // Atualizar um livro
  update: (id, bookData) => api.patch(`/books/${id}`, bookData),

  // Deletar um livro
  delete: (id) => api.delete(`/books/${id}`),

  // Upload de imagem
  uploadImage: (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    return api.post('/books/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
  }
}

export default api
