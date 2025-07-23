<template>
  <div class="book-form-container">
    <div class="card">
      <h2>{{ isEditing ? 'Editar Livro' : 'Adicionar Novo Livro' }}</h2>

      <form @submit.prevent="handleSubmit" class="book-form">
        <div class="form-group">
          <label for="nome" class="form-label">Nome do Livro *</label>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            class="form-input"
            :class="{ 'error': errors.nome }"
            placeholder="Digite o nome do livro"
            required
          >
          <span v-if="errors.nome" class="error-text">{{ errors.nome }}</span>
        </div>

        <div class="form-group">
          <label for="autor" class="form-label">Autor *</label>
          <input
            id="autor"
            v-model="form.autor"
            type="text"
            class="form-input"
            :class="{ 'error': errors.autor }"
            placeholder="Digite o nome do autor"
            required
          >
          <span v-if="errors.autor" class="error-text">{{ errors.autor }}</span>
        </div>

        <div class="form-group">
          <label for="anoLancamento" class="form-label">Ano de Lançamento</label>
          <input
            id="anoLancamento"
            v-model.number="form.anoLancamento"
            type="number"
            class="form-input"
            :class="{ 'error': errors.anoLancamento }"
            placeholder="Ex: 2023"
            min="1000"
            :max="currentYear"
          >
          <span v-if="errors.anoLancamento" class="error-text">{{ errors.anoLancamento }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Capa do Livro</label>
          <ImageUpload v-model="form.imagemCapa" />
        </div>

        <div class="form-group">
          <label class="form-label">Minha Avaliação</label>
          <StarRating
            v-model="form.nota"
            :showLabel="true"
          />
        </div>

        <div class="form-group">
          <label for="minhaOpiniao" class="form-label">Minha Opinião</label>
          <textarea
            id="minhaOpiniao"
            v-model="form.minhaOpiniao"
            class="form-textarea"
            :class="{ 'error': errors.minhaOpiniao }"
            placeholder="Escreva sua opinião sobre o livro, suas reflexões, o que mais gostou..."
            rows="5"
          ></textarea>
          <div class="character-count">
            {{ form.minhaOpiniao?.length || 0 }}/1000 caracteres
          </div>
          <span v-if="errors.minhaOpiniao" class="error-text">{{ errors.minhaOpiniao }}</span>
        </div>

        <div class="form-actions">
          <router-link to="/" class="btn btn-secondary">
            ← Cancelar
          </router-link>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? '💾 Salvar Alterações' : '📚 Adicionar Livro') }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import StarRating from './StarRating.vue'
import ImageUpload from './ImageUpload.vue'
import { booksAPI } from '../services/api.js'

export default {
  name: 'BookForm',
  components: {
    StarRating,
    ImageUpload
  },
  props: {
    bookId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      form: {
        nome: '',
        autor: '',
        anoLancamento: null,
        minhaOpiniao: '',
        imagemCapa: '',
        nota: 0
      },
      errors: {},
      submitting: false,
      loading: false,
      toast: {
        show: false,
        message: '',
        type: 'success' // success, error
      }
    }
  },
  computed: {
    isEditing() {
      return !!this.bookId
    },
    currentYear() {
      return new Date().getFullYear()
    }
  },
  async mounted() {
    if (this.isEditing) {
      await this.loadBook()
    }
  },
  methods: {
    async loadBook() {
      this.loading = true

      try {
        const response = await booksAPI.getById(this.bookId)
        const book = response.data

        // Preenche o formulário com os dados do livro
        this.form = {
          nome: book.nome || '',
          autor: book.autor || '',
          anoLancamento: book.anoLancamento || null,
          minhaOpiniao: book.minhaOpiniao || '',
          imagemCapa: book.imagemCapa || '',
          nota: book.nota || 0
        }
      } catch (error) {
        console.error('Erro ao carregar livro:', error)
        this.showToast('Erro ao carregar os dados do livro', 'error')

        // Redireciona para home em caso de erro
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      } finally {
        this.loading = false
      }
    },

    validateForm() {
      this.errors = {}

      // Nome é obrigatório
      if (!this.form.nome?.trim()) {
        this.errors.nome = 'O nome do livro é obrigatório'
      } else if (this.form.nome.length > 200) {
        this.errors.nome = 'O nome deve ter no máximo 200 caracteres'
      }

      // Autor é obrigatório
      if (!this.form.autor?.trim()) {
        this.errors.autor = 'O nome do autor é obrigatório'
      } else if (this.form.autor.length > 100) {
        this.errors.autor = 'O nome do autor deve ter no máximo 100 caracteres'
      }

      // Validação do ano
      if (this.form.anoLancamento) {
        if (this.form.anoLancamento < 1000 || this.form.anoLancamento > this.currentYear) {
          this.errors.anoLancamento = `Ano deve estar entre 1000 e ${this.currentYear}`
        }
      }

      // Validação da opinião
      if (this.form.minhaOpiniao && this.form.minhaOpiniao.length > 1000) {
        this.errors.minhaOpiniao = 'A opinião deve ter no máximo 1000 caracteres'
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        this.showToast('Por favor, corrija os erros no formulário', 'error')
        return
      }

      this.submitting = true

      try {
        // Prepara os dados para envio (remove campos vazios)
        const bookData = {
          nome: this.form.nome.trim(),
          autor: this.form.autor.trim(),
          ...(this.form.anoLancamento && { anoLancamento: this.form.anoLancamento }),
          ...(this.form.minhaOpiniao?.trim() && { minhaOpiniao: this.form.minhaOpiniao.trim() }),
          ...(this.form.imagemCapa && { imagemCapa: this.form.imagemCapa }),
          ...(this.form.nota > 0 && { nota: this.form.nota })
        }

        if (this.isEditing) {
          await booksAPI.update(this.bookId, bookData)
          this.showToast('Livro atualizado com sucesso! 📚', 'success')
        } else {
          await booksAPI.create(bookData)
          this.showToast('Livro adicionado com sucesso! 🎉', 'success')
        }

        // Redireciona para a home após 1.5 segundos
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)

      } catch (error) {
        console.error('Erro ao salvar livro:', error)

        // Trata erros de validação da API
        if (error.response?.status === 400) {
          const apiErrors = error.response.data.message
          if (Array.isArray(apiErrors)) {
            // Limpa erros anteriores para exibir apenas os da API
            this.errors = {}
            apiErrors.forEach(err => {
              const field = err.property
              // ✅ Usa Object.hasOwn() para verificação mais segura
              if (field && Object.hasOwn(this.form, field)) {
                const errorMessage = err.constraints ? Object.values(err.constraints)[0] : 'Campo inválido'
                // ✅ Usa this.$set para garantir reatividade no Vue 2
                this.$set(this.errors, field, errorMessage)
              }
            })
          }
          this.showToast('Verifique os campos do formulário', 'error')
        } else {
          this.showToast('Erro ao salvar o livro. Tente novamente.', 'error')
        }
      } finally {
        this.submitting = false
      }
    },

    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type
      }

      // Remove o toast após 4 segundos
      setTimeout(() => {
        this.toast.show = false
      }, 4000)
    }
  }
}
</script>

<style scoped>
.book-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.book-form h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--pastel-pink);
  background: linear-gradient(135deg, white, rgba(248, 187, 217, 0.1));
}

.error-text {
  display: block;
  margin-top: var(--spacing-xs);
  color: #D63384;
  font-size: 0.9rem;
}

.character-count {
  text-align: right;
  margin-top: var(--spacing-xs);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.form-actions .btn {
  min-width: 140px;
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Toast notifications */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: toastSlide 0.3s ease-out;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.toast.success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.toast.error {
  background: linear-gradient(135deg, #dc3545, #fd7e14);
}

@keyframes toastSlide {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Loading state */
.book-form:has(.submitting) {
  opacity: 0.7;
  pointer-events: none;
}

/* Responsividade */
@media (max-width: 768px) {
  .book-form-container {
    padding: var(--spacing-sm);
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
