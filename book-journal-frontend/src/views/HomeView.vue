<template>
  <div class="home-view">
    <div class="container">
      <!-- Header -->
      <header class="home-header">
        <h1>📚 Diário de Leituras</h1>
        <p class="subtitle">Suas leituras organizadas com carinho</p>

        <div class="header-actions">
          <router-link to="/add" class="btn btn-primary">
            ➕ Adicionar Livro
          </router-link>
        </div>
      </header>

      <!-- Stats -->
      <div class="stats-section" v-if="books.length > 0">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ books.length }}</div>
            <div class="stat-label">Livros Lidos</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">{{ averageRating }}</div>
            <div class="stat-label">Nota Média</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">{{ booksThisYear }}</div>
            <div class="stat-label">Este Ano</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section" v-if="books.length > 0">
        <div class="filters">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por título ou autor..."
            class="search-input"
          >

          <select v-model="sortBy" class="sort-select">
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="title">Título (A-Z)</option>
            <option value="author">Autor (A-Z)</option>
            <option value="rating">Melhor avaliados</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando seus livros...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-container">
        <h3>😕 Ops! Algo deu errado</h3>
        <p>{{ error }}</p>
        <button @click="loadBooks" class="btn btn-primary">Tentar Novamente</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="books.length === 0" class="empty-state">
        <div class="empty-icon">📖</div>
        <h3>Seu diário está vazio</h3>
        <p>Que tal adicionar o primeiro livro?</p>
        <router-link to="/add" class="btn btn-primary">
          📚 Adicionar Primeiro Livro
        </router-link>
      </div>

      <!-- Books Grid -->
      <div v-else-if="filteredBooks.length > 0" class="books-section">
        <div class="books-grid">
          <BookCard
            v-for="book in filteredBooks"
            :key="book._id"
            :book="book"
            @book-deleted="handleBookDeleted"
          />
        </div>
      </div>

      <!-- No results -->
      <div v-else class="no-results">
        <h3>🔍 Nenhum livro encontrado</h3>
        <p>Tente alterar os filtros de busca</p>
        <button @click="clearFilters" class="btn btn-secondary">Limpar Filtros</button>
      </div>
    </div>
  </div>
</template>

<script>
import BookCard from '../components/BookCard.vue'
import { booksAPI } from '../services/api.js'

export default {
  name: 'HomeView',
  components: {
    BookCard
  },
  data() {
    return {
      books: [],
      loading: true,
      error: null,
      searchQuery: '',
      sortBy: 'newest'
    }
  },
  computed: {
    filteredBooks() {
      let filtered = [...this.books]

      // Filtro de busca
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(book =>
          book.nome.toLowerCase().includes(query) ||
          book.autor.toLowerCase().includes(query)
        )
      }

      // Ordenação
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt)

          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt)

          case 'title':
            return a.nome.localeCompare(b.nome, 'pt-BR')

          case 'author':
            return a.autor.localeCompare(b.autor, 'pt-BR')

          case 'rating':
            return (b.nota || 0) - (a.nota || 0)

          default:
            return 0
        }
      })

      return filtered
    },

    averageRating() {
      if (this.books.length === 0) return '0.0'

      const booksWithRating = this.books.filter(book => book.nota > 0)
      if (booksWithRating.length === 0) return '0.0'

      const sum = booksWithRating.reduce((acc, book) => acc + book.nota, 0)
      return (sum / booksWithRating.length).toFixed(1)
    },

    booksThisYear() {
      const currentYear = new Date().getFullYear()
      return this.books.filter(book => {
        const bookYear = new Date(book.createdAt).getFullYear()
        return bookYear === currentYear
      }).length
    }
  },
  async mounted() {
    await this.loadBooks()
  },
  methods: {
    async loadBooks() {
      this.loading = true
      this.error = null

      try {
        const response = await booksAPI.getAll()
        this.books = response.data
      } catch (error) {
        console.error('Erro ao carregar livros:', error)
        this.error = 'Não foi possível carregar os livros. Verifique sua conexão.'
      } finally {
        this.loading = false
      }
    },

    handleBookDeleted(bookId) {
      // Remove o livro da lista local
      this.books = this.books.filter(book => book._id !== bookId)
    },

    clearFilters() {
      this.searchQuery = ''
      this.sortBy = 'newest'
    }
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
}

.home-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin-bottom: var(--spacing-lg);
  font-style: italic;
}

.header-actions {
  margin-top: var(--spacing-lg);
}

/* Stats */
.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  background: linear-gradient(135deg, var(--card-background), var(--pastel-lavender));
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(184, 134, 11, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  font-family: var(--font-serif);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: var(--spacing-xs);
}

/* Filters */
.filters-section {
  margin-bottom: var(--spacing-lg);
}

.filters {
  display: flex;
  gap: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.search-input,
.sort-select {
  flex: 1;
  min-width: 200px;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: var(--font-body);
  background: white;
}

.search-input:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
}

/* Loading */
.loading-container {
  text-align: center;
  padding: var(--spacing-xl);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error & Empty States */
.error-container,
.empty-state,
.no-results {
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.empty-state h3,
.no-results h3,
.error-container h3 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

/* Books Grid */
.books-section {
  margin-top: var(--spacing-lg);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

/* Responsividade */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .search-input,
  .sort-select {
    min-width: auto;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
