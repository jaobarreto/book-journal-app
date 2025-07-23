<template>
  <div class="edit-book-view">
    <BookForm :bookId="$route.params.id" />
  </div>
</template>

<script>
import BookForm from '../components/BookForm.vue'

export default {
  name: 'EditBookView',
  components: {
    BookForm
  }
}
</script>

<style scoped>
.edit-book-view {
  min-height: 100vh;
  padding: var(--spacing-lg) 0;
}
</style>
