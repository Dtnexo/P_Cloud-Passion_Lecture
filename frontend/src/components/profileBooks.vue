<script setup>
import { ref, onMounted } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import booksCard from '@/components/booksCard.vue'
const props = defineProps({
  userId: {
    required: true,
    type: [String, Number],
  },
})
const bookUser = ref([])

onMounted(() => {
  ouvrageServices.getBookUserById(props.userId).then((data) => {
    bookUser.value = data.data.data || []
  })
})
</script>
<template>
  <div class="profile-section">
    <div>
      <h3>Ouvrages postés ({{ bookUser.length }})</h3>
    </div>
    <div class="booksCard" v-if="bookUser.length > 0">
      <booksCard
        v-for="book in bookUser"
        :key="book.ouvrage_id"
        :book="book"
        :userId="props.userId"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-section {
  margin: 40px auto;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
}

.profile-section h3 {
  color: #1e293b;
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-family: 'Georgia', serif;
  font-weight: 700;
  text-align: left;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 16px;
  display: block;
}

.booksCard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 30px;
  justify-content: center;
}

/* Override booksCard default margin */
.booksCard > * {
  margin: 0 !important;
}

@media (max-width: 768px) {
  .booksCard {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .booksCard {
    grid-template-columns: 1fr;
  }
}
</style>
