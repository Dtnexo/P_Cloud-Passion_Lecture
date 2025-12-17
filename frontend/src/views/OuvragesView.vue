<script setup>
import Filter from '@/components/filter.vue'
import ouvrageServices from '../../services/ouvrageServices'
import booksCard from '@/components/booksCard.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFlashMessageStore } from '@/stores/flashMessage'

const route = useRoute()
const title = ref('')
const authorId = ref(0)
const categorieId = ref(0)
const books = ref([])
const filteredBooks = ref([])
const errorMessage = ref(false)
const flashMessageStore = useFlashMessageStore()

const fetchBooks = () => {
  ouvrageServices
    .getAllBooks({ title: title.value })
    .then((response) => {
      errorMessage.value = false
      books.value = response.data.data
      applyFilters()
    })
    .catch((error) => {
      errorMessage.value = true
      filteredBooks.value = null
      console.error('Erreur lors de la récupération des livres :', error.response.data.error)
    })
}

const flashMessage = ref({ type: '', message: '' })
onMounted(() => {
  fetchBooks()

  if (flashMessageStore.type) {
    fetchBooks()
    flashMessage.value = {
      type: flashMessageStore.type,
      message: flashMessageStore.message,
    }

    setTimeout(() => {
      flashMessage.value = { type: '', message: '' }
      flashMessageStore.clearFlashMessage()
    }, 3000)
  }
})
const emitTitle = (searchValue) => {
  title.value = searchValue
  fetchBooks()
}
const filterAuthor = (authorValue) => {
  authorId.value = authorValue
  applyFilters()
}

const filterCategorie = (categorieValue) => {
  categorieId.value = categorieValue
  applyFilters()
}
const applyFilters = () => {
  filteredBooks.value = books.value.filter((book) => {
    const matchAuthor = authorId.value === 0 || book.ouvrage.ecrivain_fk === authorId.value
    const matchCategory = categorieId.value === 0 || book.ouvrage.categorie_fk === categorieId.value
    return matchAuthor && matchCategory
  })
  if (filteredBooks.value.length == 0) errorMessage.value = true
  else errorMessage.value = false
}
const seeAll = () => {
  authorId.value = 0
  categorieId.value = 0
  title.value = 0
  fetchBooks()
}
</script>

<template>
  <div v-if="flashMessage.message" :class="['flash-message', flashMessage.type]">
    {{ flashMessage.message }}
  </div>
  <Filter
    @title="emitTitle"
    @author="filterAuthor"
    @categorie="filterCategorie"
    @seeAll="seeAll"
  ></Filter>
  <section class="books-container">
    <p id="errorMessage" v-show="errorMessage">Aucun livre ne correspond à la recherche</p>
    <div class="books">
      <booksCard v-for="book in filteredBooks" :key="book.id" :book="book" />
    </div>
  </section>
  <RouterLink to="/addBook" class="addBook" title="Ajouter un livre">+</RouterLink>
</template>

<style scoped>
.flash-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  animation: fade-in-out 3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 8px;
}

.flash-message.success {
  background-color: #10b981;
  color: white;
}

.addBook {
  text-decoration: none;
  right: 40px;
  bottom: 40px;
  font-size: 32px;
  background-color: var(--secondary);
  color: white;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  user-select: none;
  cursor: pointer;
  position: fixed;
  transition:
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 90;
}

.addBook:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: scale(1.1);
  background-color: #3a698a;
}

.addBook:active {
  transform: scale(0.95);
}

.books-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

#errorMessage {
  font-size: 1.1rem;
  color: #c53030;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  padding: 20px;
  margin: 40px auto;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.books {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 32px;
  width: 100%;
  padding-bottom: 40px;
}

@media (max-width: 640px) {
  .books {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .books-container {
    padding: 16px;
  }

  .addBook {
    width: 56px;
    height: 56px;
    right: 20px;
    bottom: 20px;
    font-size: 28px;
  }
}
</style>
