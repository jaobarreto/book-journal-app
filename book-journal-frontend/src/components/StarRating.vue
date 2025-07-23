<template>
  <div class="star-rating">
    <span
      v-for="star in 5"
      :key="star"
      class="star"
      :class="{ filled: star <= currentRating }"
      @click="setRating(star)"
      @mouseover="hoverRating = star"
      @mouseleave="hoverRating = 0"
    >
      {{ (hoverRating >= star || (!hoverRating && currentRating >= star)) ? '★' : '☆' }}
    </span>
    <span v-if="showLabel" class="rating-label">
      {{ getRatingText(currentRating) }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'StarRating',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    readonly: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      hoverRating: 0
    }
  },
  computed: {
    currentRating() {
      return this.modelValue || 0
    }
  },
  methods: {
    setRating(rating) {
      if (this.readonly) return

      // Se clicar na mesma estrela, remove a avaliação
      const newRating = this.currentRating === rating ? 0 : rating
      this.$emit('update:modelValue', newRating)
    },
    getRatingText(rating) {
      const texts = {
        0: 'Sem avaliação',
        1: 'Não gostei',
        2: 'Mais ou menos',
        3: 'Gostei',
        4: 'Muito bom',
        5: 'Excelente!'
      }
      return texts[rating] || 'Sem avaliação'
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: var(--spacing-sm) 0;
}

.star {
  font-size: 1.8rem;
  color: var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(1px 1px 2px rgba(184, 134, 11, 0.1));
  user-select: none;
}

.star.filled {
  color: #FFD700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

.star:hover:not(.readonly) {
  color: #FFA500;
  transform: scale(1.15);
}

.readonly .star {
  cursor: default;
}

.readonly .star:hover {
  transform: none;
}

.rating-label {
  margin-left: var(--spacing-sm);
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}
</style>
