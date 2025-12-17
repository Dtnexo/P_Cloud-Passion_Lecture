<script setup>
import { onMounted, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
const categories = ref([])
const authors = ref([])
const search = ref('')
const emit = defineEmits(['title', 'author', 'categorie', 'seeAll'])

onMounted(() => {
  ouvrageServices.getAllCategories().then((res) => {
    categories.value = res.data.data.map((cat) => ({
      id: cat.categorie_id,
      nom: cat.nom,
    }))
  })
  ouvrageServices.getAllAuthors().then((res) => {
    authors.value = res.data.data.map((auth) => ({
      id: auth.ecrivain_id,
      nom: auth.prenom + ' ' + auth.nom,
    }))
  })
})
const selected = ref({
  categorie: '',
  author: '',
})

const open = ref(null)
const toggleSelect = (name) => {
  open.value = open.value === name ? null : name
  emit('open', open.value)
}

const selectOption = (name, value) => {
  selected.value[name] = value
  open.value = null
  emit(name, value.id)
}
const searchEmit = () => {
  if (search.value.length > 2 || search.value.length == 0) {
    emit('title', search.value)
  }
}
const seeAll = () => {
  open.value = null
  selected.value = {
    categorie: '',
    author: '',
  }
  search.value = ''
  emit('seeAll')
}
const clickFilter = () => {
  open.value = null
}
</script>

<template>
  <div class="filters">
    <div class="custom-select" @click.stop="toggleSelect('categorie')">
      <div class="selected">{{ selected.categorie.nom || 'Catégorie' }}</div>
      <ul class="options" v-show="open === 'categorie'">
        <li
          v-for="categorie in categories"
          :key="categorie.id"
          @click.stop="selectOption('categorie', categorie)"
        >
          {{ categorie.nom }}
        </li>
      </ul>
    </div>
    <div class="custom-select" @click.stop="toggleSelect('author')">
      <div class="selected">{{ selected.author.nom || 'Auteur' }}</div>
      <ul class="options" v-show="open === 'author'">
        <li v-for="author in authors" :key="author.id" @click.stop="selectOption('author', author)">
          {{ author.nom }}
        </li>
      </ul>
    </div>

    <input
      @click="clickFilter"
      type="text"
      placeholder="Recherche livre"
      v-model="search"
      @keyup="searchEmit"
    />
    <button type="button" @click="seeAll">Tout voir</button>
  </div>
</template>
<style scoped>
.filters {
  width: 100%; /* Better fit */
  max-width: 1200px;
  background-color: var(--surface);
  padding: 12px 24px;
  border-radius: 16px; /* Smooth corners */
  display: flex;
  flex-wrap: wrap; /* Allow wrapping on medium screens */
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto 40px; /* More bottom spacing */
  position: sticky;
  top: 80px; /* Below fixed header */
  z-index: 900;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Soft shadow */
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Common select/input styling wrapper */
.custom-select,
.filters input[type='text'],
.filters button {
  height: 48px;
  display: flex;
  align-items: center;
  font-family: var(--font-main);
}

.custom-select {
  position: relative;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-main);
  background-color: #f8fafe; /* Light background for fields */
  padding: 0;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent; /* Prepare for hover */
  transition: all 0.2s ease;
  min-width: 180px;
}

.custom-select:hover {
  background-color: #e2e8f0;
}

.custom-select .selected {
  width: 100%;
  height: 100%;
  padding: 0 40px 0 16px;
  display: flex;
  align-items: center;
  /* SVG chevron icon */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%2364748b' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
}

.custom-select .options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background-color: var(--surface);
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 10;
  overflow: hidden;
  padding: 8px 0;
  list-style: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-select .options li {
  padding: 10px 16px;
  font-size: 0.95rem;
  color: var(--text-main);
  cursor: pointer;
  transition: background 0.1s;
}

.custom-select .options li:hover {
  background-color: #f1f5f9;
  color: var(--secondary);
}

.filters input[type='text'] {
  flex-grow: 1; /* Take remaining space */
  padding: 0 20px 0 48px;
  border-radius: 12px;
  border: 1px solid transparent;
  background-color: #f8fafe;
  color: var(--text-main);
  font-size: 0.95rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2394a3b8' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath d='M21.53 20.47l-5.1-5.1A7.94 7.94 0 0018 10a8 8 0 10-8 8 7.94 7.94 0 005.37-1.57l5.1 5.1a.75.75 0 101.06-1.06zM4 10a6 6 0 1112 0 6 6 0 01-12 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 16px center;
  transition: all 0.2s ease;
}

.filters input[type='text']:focus {
  outline: none;
  background-color: var(--surface);
  border-color: var(--secondary);
  box-shadow: 0 0 0 3px rgba(69, 123, 157, 0.1);
}

.filters input[type='text']::placeholder {
  color: #94a3b8;
}

.filters button {
  padding: 0 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  background-color: transparent;
  border: 1px solid #cbd5e1;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filters button:hover {
  border-color: var(--secondary);
  color: var(--secondary);
  background-color: #f0f9ff;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    padding: 16px;
    align-items: stretch; /* Full width children */
    gap: 12px;
    top: 60px; /* Adjust for mobile header path */
  }

  .custom-select,
  .filters input[type='text'],
  .filters button {
    width: 100%;
    min-width: 0;
  }
}
</style>
