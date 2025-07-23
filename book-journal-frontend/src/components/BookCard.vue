<template>
  <div class="book-card card fade-in">
    <div class="book-header">
      <div class="book-image">
        <img
          v-if="book.imagemCapa"
          :src="book.imagemCapa"
          :alt="`Capa de ${book.nome}`"
          class="cover-image"
          @error="handleImageError"
        >
        <div v-else class="placeholder-image">
          <span class="book-icon">📖</span>
        </div>
      </div>

      <div class="book-info">
        <h3 class="book-title">{{ book.nome }}</h3>
        <p class="book-author">por {{ book.autor }}</p>
        <p v-if="book.anoLancamento" class="book-year">{{ book.anoLancamento }}</p>

        <StarRating
          :modelValue="book.nota || 0"
          :readonly="true"
        />
      </div>
    </div>

    <div v-if="book.minhaOpiniao" class="book-opinion">
      <p class="opinion-text">{{ truncatedOpinion }}</p>
      <button
        v-if="book.minhaOpiniao.length > 150"
        @click="toggleFullOpinion"
        class="read-more-btn"
      >
        {{ showFullOpinion ? 'Ver menos' : 'Ver mais' }}
      </button>
    </div>

    <div class="book-actions">
      <router-link
        :to="`/edit/${book._id}`"
        class="btn btn-secondary"
      >
        ✏️ Editar
      </router-link>

      <button
        @click="confirmDelete"
        class="btn btn-danger"
        :disabled="deleting"
      >
        {{ deleting ? '⏳' : '🗑️' }} Excluir
      </button>
    </div>

    <div class="book-date">
      <small>Adicionado em {{ formatDate(book.createdAt) }}</small>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja excluir <strong>"{{ book.nome }}"</strong>?</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Cancelar</button>
          <button @click="deleteBook" class="btn btn-danger">Excluir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from './StarRating.vue'
import { booksAPI } from '../services/api.js'

export default {
  name: 'BookCard',
  components: {
    StarRating
  },
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  emits: ['book-deleted'],
  data() {
    return {
      showFullOpinion: false,
      showDeleteModal: false,
      deleting: false
    }
  },
  computed: {
    truncatedOpinion() {
      if (!this.book.minhaOpiniao) return ''

      if (this.showFullOpinion || this.book.minhaOpiniao.length <= 150) {
        return this.book.minhaOpiniao
      }

      return this.book.minhaOpiniao.substring(0, 150) + '...'
    }
  },
  methods: {
    toggleFullOpinion() {
      this.showFullOpinion = !this.showFullOpinion
    },

    confirmDelete() {
      this.showDeleteModal = true
    },

    cancelDelete() {
      this.showDeleteModal = false
    },

    async deleteBook() {
      this.deleting = true

      try {
        await booksAPI.delete(this.book._id)
        this.$emit('book-deleted', this.book._id)
        this.showDeleteModal = false
      } catch (error) {
        console.error('Erro ao excluir livro:', error)
        alert('Erro ao excluir o livro. Tente novamente.')
      } finally {
        this.deleting = false
      }
    },

    handleImageError(event) {
      // Se a imagem falhar ao carregar, esconde ela
      event.target.style.display = 'none'
    },

    formatDate(dateString) {
      if (!dateString) return ''

      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.book-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.book-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.book-image {
  flex-shrink: 0;
  width: 100px;
  height: 140px;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--pastel-lavender);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--pastel-lavender), var(--pastel-peach));
}

.book-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.3rem;
  color: var(--primary-color);
  line-height: 1.3;
}

.book-author {
  margin: 0;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 1rem;
}

.book-year {
  margin: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.book-opinion {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, var(--pastel-mint), white);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--pastel-blue);
}

.opinion-text {
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.read-more-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0;
}

.read-more-btn:hover {
  color: var(--secondary-color);
}

.book-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.book-actions .btn {
  flex: 1;
  font-size: 0.9rem;
  padding: var(--spacing-xs) var(--spacing-sm);
}

.book-date {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card-background);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
  color: var(--primary-color);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-top: var(--spacing-md);
}

.modal-actions .btn {
  min-width: 100px;
}
</style>
