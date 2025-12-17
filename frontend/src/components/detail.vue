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
      <div class="title">
        <div>
          <h2>
            {{ book.titre }}
          </h2>
          <p class="authorCss"><strong>Par</strong> {{ author }}</p>
        </div>
        <p class="caseCat">{{ categorie }}</p>
      </div>
      <p><strong>Résumé:</strong> {{ book.resume }}</p>
      <p><strong>Nombre de pages:</strong> {{ book.nb_pages }}</p>
      <p><strong>Année d'édition:</strong> {{ formattedDate }}</p>
      <p><strong>Éditeur:</strong> {{ book.nom_editeur }}</p>

      <p><strong>Ajouté par: </strong> {{ user.pseudo }}</p>
      <a :href="`/pdfs/${book.extrait}`" target="_blank" class="extrait-link">Voir un extrait</a>

      <div v-if="canUpdate" class="editDelete">
        <RouterLink :to="link" class="editOuvrage">
          <img src="/images/editUpdate.png" alt="edit"
        /></RouterLink>
        <a class="deleteOuvrage"
          ><img src="/images/trash-can.png" alt="delete" @click="showConfirmation"
        /></a>
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
  background: linear-gradient(135deg, #1d72b8 0%, #4facfe 100%);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(29, 114, 184, 0.3);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: default;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.caseCat:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(29, 114, 184, 0.4);
}

.editOuvrage,
.deleteOuvrage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #f8f9fa;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.editOuvrage:hover {
  background-color: #e3f2fd;
  border-color: #bbdefb;
  transform: translateY(-2px);
}

.deleteOuvrage:hover {
  background-color: #ffebee;
  border-color: #ffcdd2;
  transform: translateY(-2px);
}

.editOuvrage img,
.deleteOuvrage img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.editOuvrage:hover img,
.deleteOuvrage:hover img {
  opacity: 1;
}

.flash-message {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.flash-message.success {
  background-color: #2ecc71;
  color: white;
}

.flash-message.error {
  background-color: #e74c3c;
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
  display: flex;
  flex-direction: row; /* Desktop default */
  align-items: flex-start;
  gap: 40px;
  max-width: 1000px;
  margin: 60px auto;
  padding: 40px; /* More breathing room */
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); /* Softer, deeper shadow */
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

.moyenne-note {
  position: absolute;
  top: 20px;
  left: 20px;
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  color: #f1c40f;
  font-size: 1rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  gap: 6px;
  z-index: 2;
  transition: transform 0.2s ease;
}

.moyenne-note:hover {
  transform: scale(1.05);
}

.cover {
  width: 320px; /* Fixed width for consistency */
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  object-fit: cover;
  flex-shrink: 0; /* Prevent squishing */
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 15px;
}

.info h2 {
  font-size: 2.2rem;
  color: #1d3557;
  margin: 0 0 5px 0;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.authorCss {
  margin: 0;
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
}

.info p {
  font-size: 1rem;
  line-height: 1.7;
  color: #495057;
  margin-bottom: 12px;
}

.info p strong {
  color: #212529;
  font-weight: 600;
  margin-right: 5px;
}

.extrait-link {
  display: inline-block;
  margin-top: 30px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #1d72b8 0%, #00509d 100%);
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(29, 114, 184, 0.25);
  align-self: flex-start; /* Keep left */
}

.extrait-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(29, 114, 184, 0.35);
  background: linear-gradient(135deg, #155a96 0%, #003f7f 100%);
}

.editDelete {
  margin-top: auto; /* Push to bottom if container has height, else just margin */
  padding-top: 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f8f9fa;
}

@media (max-width: 900px) {
  .book-detail {
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
    margin: 20px;
  }

  .cover {
    width: 100%;
    max-width: 300px; /* Limit size on mobile */
  }

  .title {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }

  .info {
    width: 100%;
    align-items: center; /* Center content column */
    text-align: center;
  }

  .info h2 {
    font-size: 1.8rem;
  }

  .extrait-link {
    align-self: center;
  }

  .editDelete {
    justify-content: center;
    width: 100%;
    margin-top: 30px;
  }
}
</style>
