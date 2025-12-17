<script setup>
import { onMounted, ref, computed, watch, defineExpose } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import { useFlashMessageStore } from '@/stores/flashMessage'
import router from '@/router'
import confirmation from './confirmation.vue'

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})

const book = props.book.ouvrage
const categorie = props.book.categories
const author = props.book.écrivain
const currentUserId = getUserIdFromToken()
const user = ref('')
const userNow = ref('')
const notes = ref([])

onMounted(() => {
  ouvrageServices.getUserById(book.user_fk).then((res) => {
    user.value = res.data.utilisateur
  })
  ouvrageServices.getUserById(currentUserId).then((res) => {
    userNow.value = res.data.utilisateur
  })
  ouvrageServices.getComments(book.ouvrage_id).then((res) => {
    notes.value = res.data.data.map((e) => e.note)
  })
})

function reloadNotes() {
  ouvrageServices.getComments(book.ouvrage_id).then((res) => {
    notes.value = res.data.data.map((e) => e.note)
  })
}

defineExpose({ reloadNotes })

function getUserIdFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    // Le token est sous la forme "Bearer <jwt>", il faut extraire la partie JWT
    const jwt = token.split(' ')[1]
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    return payload.userId
  } catch (e) {
    return null
  }
}

const moyenneNote = computed(() => {
  if (!notes.value.length) return null
  const sum = notes.value.reduce((acc, n) => acc + n, 0)
  return (sum / notes.value.length).toFixed(1)
})

const formattedDate = new Date(book.annee_edition).toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const link = `/updateBook/${book.ouvrage_id}`
const deleteBook = () => {
  ouvrageServices
    .deleteBook(book.ouvrage_id)
    .then((_) => {
      useFlashMessageStore().setFlashMessage(
        'success',
        `Le livre "${book.titre}" a bien été supprimé.`,
      )
      router.back()
    })
    .catch((err) => {
      console.error(err)
      useFlashMessageStore().setFlashMessage(
        'error',
        `La supression du livre a échoué ! Réessayez dans un instant.`,
      )
      setTimeout(() => {
        useFlashMessageStore().clearFlashMessage()
      }, 3000)
    })
  if (useFlashMessageStore().type == 'error') {
  }
}
const confirm = ref(false)
const showConfirmation = () => {
  confirm.value = true
}
const hideConfirmation = () => {
  confirm.value = false
}

const canUpdate = computed(() => {
  if (currentUserId == book.user_fk || userNow.value.admin) {
    return true
  } else {
    return false
  }
})
const DB_URL = import.meta.env.VITE_DB_URL
</script>

<template>
  <div v-if="useFlashMessageStore().type" :class="['flash-message', useFlashMessageStore().type]">
    {{ useFlashMessageStore().message }}
  </div>
  <div class="book-detail">
    <span v-if="moyenneNote !== null" class="moyenne-note"> ⭐ {{ moyenneNote }}/5 </span>
    <img
      :src="`${DB_URL}${props.book.ouvrage.image}`"
      :alt="`Couverture de ${book.titre}`"
      class="cover"
    />

    <div class="info">
      <div class="header-group">
        <span class="caseCat">{{ categorie }}</span>
        <div class="title-row">
          <h2>{{ book.titre }}</h2>
        </div>
        <p class="authorCss">
          Par <strong>{{ author }}</strong>
        </p>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Pages</span>
          <span class="meta-value">{{ book.nb_pages }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Publication</span>
          <span class="meta-value">{{ formattedDate }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Éditeur</span>
          <span class="meta-value">{{ book.nom_editeur }}</span>
        </div>
        <div class="meta-item" v-if="user && user.pseudo">
          <span class="meta-label">Ajouté par</span>
          <span class="meta-value">{{ user.pseudo }}</span>
        </div>
      </div>

      <div class="resume-section">
        <h3>Résumé</h3>
        <p class="resume-text">{{ book.resume }}</p>
      </div>

      <div class="actions-row">
        <a :href="`/pdfs/${book.extrait}`" target="_blank" class="extrait-link">
          <span>Lire un extrait</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </a>

        <div v-if="canUpdate" class="editDelete">
          <RouterLink :to="link" class="editOuvrage" title="Modifier">
            <img src="/images/editUpdate.png" alt="edit" />
          </RouterLink>
          <button class="deleteOuvrage" @click="showConfirmation" title="Supprimer">
            <img src="/images/trash-can.png" alt="delete" />
          </button>
        </div>
      </div>
    </div>
  </div>
  <confirmation
    v-show="confirm"
    :titre="book.titre"
    :comment="false"
    @confirm="deleteBook"
    @cancel="hideConfirmation"
  />
</template>

<style>
.caseCat {
  display: inline-block;
  padding: 6px 14px;
  background-color: var(--surface);
  color: var(--secondary);
  border: 1px solid var(--secondary);
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.2s ease;
  cursor: default;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.caseCat:hover {
  background-color: var(--secondary);
  color: white;
}

.editOuvrage,
.deleteOuvrage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f8fafe;
  margin-left: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.editOuvrage:hover,
.deleteOuvrage:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.deleteOuvrage:hover img {
  filter: brightness(0.8) sepia(1) hue-rotate(-50deg) saturate(3);
}

.editOuvrage img,
.deleteOuvrage img {
  width: 20px;
  height: 20px;
  opacity: 0.6;
  transition: all 0.2s;
}

.flash-message {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 8px;
}

.flash-message.success {
  background-color: #10b981;
  color: white;
}

.flash-message.error {
  background-color: #ef4444;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>

<style scoped>
.book-detail {
  position: relative;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 60px;
  max-width: 1200px;
  margin: 60px auto;
  padding: 60px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  box-shadow:
    0 20px 50px -10px rgba(0, 0, 0, 0.1),
    0 0 1px rgba(0, 0, 0, 0.1);
  font-family: var(--font-main);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.moyenne-note {
  position: absolute;
  top: 24px;
  left: 24px;
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: #1a202c;
  font-size: 1rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 50px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  gap: 6px;
  z-index: 10;
}

.cover {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  object-fit: cover;
  transition: transform 0.4s ease;
  aspect-ratio: 2/3;
}

.cover:hover {
  transform: scale(1.02);
}

.info {
  display: flex;
  flex-direction: column;
}

/* Header Group */
.header-group {
  margin-bottom: 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 32px;
}

.caseCat {
  margin-bottom: 16px; /* Pill above title */
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.title-row h2 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 3.5rem;
  color: #0f172a;
  margin: 0 0 12px 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.authorCss {
  font-size: 1.25rem;
  color: #64748b;
  margin: 0;
}

.authorCss strong {
  color: #334155;
  font-weight: 600;
}

/* Meta Grid */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.meta-item {
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.meta-item:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 4px;
}

.meta-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

/* Resume */
.resume-section {
  margin-bottom: 40px;
}

.resume-section h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1e293b;
}

.resume-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #475569;
  margin: 0;
}

/* Actions */
.actions-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.extrait-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  background-color: #0f172a; /* Dark button for high contrast */
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);
}

.extrait-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.4);
  background-color: #1e293b;
}

.editDelete {
  display: flex;
  gap: 12px;
}

/* Mobile */
@media (max-width: 900px) {
  .book-detail {
    grid-template-columns: 1fr;
    padding: 30px;
    gap: 40px;
    margin: 20px;
  }

  .header-group {
    text-align: center;
  }

  .title-row h2 {
    font-size: 2.5rem;
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-row {
    flex-direction: column;
    gap: 24px;
  }

  .extrait-link {
    width: 100%;
    justify-content: center;
  }

  .editDelete {
    width: 100%;
    justify-content: center;
  }
}
</style>
