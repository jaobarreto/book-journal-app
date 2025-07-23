<template>
  <div class="add-book-view">
    <BookForm />
  </div>
</template>

<script>
import BookForm from '../components/BookForm.vue'

export default {
  name: 'AddBookView',
  components: {
    BookForm
  }
}
</script>

<style scoped>
.add-book-view {
  min-height: 100vh;
  padding: var(--spacing-lg) 0;
}
</style>
