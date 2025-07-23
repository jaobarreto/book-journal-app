<template>
  <div class="image-upload-container">
    <div class="file-upload" @click="triggerFileInput">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        :disabled="uploading"
      >

      <div class="file-upload-label">
        <div v-if="uploading" class="upload-loading">
          <div class="spinner"></div>
          <p>Enviando imagem...</p>
        </div>

        <div v-else-if="imageUrl" class="upload-preview">
          <img :src="imageUrl" alt="Preview da capa" class="preview-image">
          <p class="upload-text">Clique para alterar a imagem</p>
        </div>

        <div v-else class="upload-placeholder">
          <div class="upload-icon">📚</div>
          <p class="upload-text">Clique para selecionar a capa do livro</p>
          <p class="upload-hint">PNG, JPG até 5MB</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { booksAPI } from '../services/api.js'

export default {
  name: 'ImageUpload',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      uploading: false,
      error: null
    }
  },
  computed: {
    imageUrl() {
      return this.modelValue || ''
    }
  },
  methods: {
    triggerFileInput() {
      if (!this.uploading) {
        this.$refs.fileInput.click()
      }
    },

    async handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validações
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor, selecione apenas arquivos de imagem'
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.error = 'A imagem deve ter no máximo 5MB'
        return
      }

      this.error = null
      this.uploading = true

      try {
        const response = await booksAPI.uploadImage(file)
        this.$emit('update:modelValue', response.data.url)

        // Limpa o input para permitir o mesmo arquivo novamente
        event.target.value = ''
      } catch (error) {
        console.error('Erro no upload:', error)
        this.error = 'Erro ao enviar a imagem. Tente novamente.'
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.file-upload {
  position: relative;
  display: block;
  cursor: pointer;
  width: 100%;
}

.file-upload input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: block;
  padding: var(--spacing-lg);
  border: 2px dashed var(--pastel-blue);
  border-radius: var(--border-radius);
  text-align: center;
  background: linear-gradient(135deg, white, var(--pastel-peach));
  transition: all 0.3s ease;
  color: var(--text-secondary);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.file-upload:hover .file-upload-label:not(.uploading) {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--pastel-peach), var(--pastel-lavender));
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(184, 134, 11, 0.1);
}

.upload-placeholder .upload-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
}

.upload-text {
  margin: var(--spacing-xs) 0;
  font-weight: 600;
  color: var(--text-primary);
}

.upload-hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.preview-image {
  max-width: 150px;
  max-height: 120px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, var(--pastel-pink), #FFB6C1);
  color: var(--text-primary);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  border: 1px solid var(--pastel-pink);
}

.uploading .file-upload-label {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
