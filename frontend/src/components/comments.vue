<script setup>
import { onMounted, ref, computed } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import router from '@/router'
import { useFlashMessageStore } from '@/stores/flashMessage'
import Addcomment from './addComment.vue'
import { useRoute } from 'vue-router'
import confirmation from './confirmation.vue'
const emit = defineEmits(['comments-updated'])

const comments = ref([])
const route = useRoute()

const getUser = async (id) => {
  try {
    const data = await ouvrageServices.getUserById(id)
    return data.data.utilisateur.pseudo
  } catch (err) {
    console.error(err)
    return 'Utilisateur inconnu'
  }
}
const currentUserId = getUserIdFromToken()

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

const fetchCommts = async () => {
  try {
    const response = await ouvrageServices.getComments(route.params.id)
    const rawComments = response.data.data

    const updatedComments = await Promise.all(
      rawComments.map(async (comment) => {
        const userName = await getUser(comment.user_fk)
        comment.user = userName
        return comment
      }),
    )

    comments.value = updatedComments
  } catch (err) {
    console.error(err)
  }
}
const userNow = ref('')
onMounted(async () => {
  await ouvrageServices.getUserById(currentUserId).then((res) => {
    userNow.value = res.data.utilisateur
  })
  fetchCommts()
})

const confirm = ref(false)
const flashMessageStore = useFlashMessageStore()

const createComment = async (comment) => {
  try {
    confirm.value = false
    await ouvrageServices.createComment(route.params.id, comment)
    fetchCommts()
    emit('comments-updated')
    flashMessageStore.setFlashMessage('success', 'Votre commentaire a été publié !')
  } catch (err) {
    console.error(err)
    flashMessageStore.setFlashMessage('error', 'Erreur lors de la publication du commentaire.')
  }
}

const showConfirmation = () => {
  confirm.value = true
}
const commentId = ref(null)
const commentaireValue = ref({
  titre: '',
})
const showConfirmationDelete = (id, commentaire) => {
  commentaireValue.value.titre = commentaire
  commentId.value = id
  deleteConfirmation.value = true
}
const hideConfirmationDelete = () => {
  deleteConfirmation.value = false
}
const hideConfirmation = () => {
  confirm.value = false
}
const deleteConfirmation = ref(false)

const deleteComment = async (id) => {
  deleteConfirmation.value = false
  try {
    await ouvrageServices.deleteComment(id)
    fetchCommts()
    emit('comments-updated')
    flashMessageStore.setFlashMessage('success', 'Commentaire supprimé avec succès.')
  } catch (err) {
    console.error(err)
    flashMessageStore.setFlashMessage('error', 'Erreur lors de la suppression du commentaire.')
  }
}

const canUpdate = (id) => {
  if (currentUserId == id || userNow.value.admin) {
    return true
  } else {
    return false
  }
}

const comment = true
</script>

<template>
  <section class="comments-section">
    <div class="comments-header">
      <h1 class="title">Commentaires</h1>
      <button class="create" @click="showConfirmation">Ajouter un commentaire</button>
    </div>
    <p class="commentsError" v-if="comments.length == 0">
      Aucun commentaire n’a encore été publié pour ce livre.
    </p>
    <div class="comments-list">
      <div v-for="comment in comments" :key="comment.evaluation_id" class="comment-card">
        <div class="comment-header">
          <span class="comment-user">{{ comment.user }}</span>
          <span class="comment-note">⭐ {{ comment.note }}/5</span>

          <button
            class="delete-btn"
            @click="showConfirmationDelete(comment.evaluation_id, comment.commentaire)"
          >
            <img
              v-if="canUpdate(comment.user_fk)"
              src="../../public/images/trash-canRed.png"
              alt="Supprimer"
              class="delete-icon"
            />
          </button>
        </div>
        <p class="comment-body">{{ comment.commentaire }}</p>
      </div>
    </div>
  </section>

  <confirmation
    v-show="deleteConfirmation"
    :titre="commentaireValue.titre"
    :comment="comment"
    @confirm="deleteComment(commentId)"
    @cancel="hideConfirmationDelete"
  />
  <Addcomment v-show="confirm" @confirm="createComment" @cancel="hideConfirmation" />
</template>

<style scoped>
.comments-section {
  padding: 40px 20px;
  background-color: transparent;
  max-width: 1100px;
  margin: 0 auto;
}

.comments-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 0 10px;
}

.title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 2rem;
  color: #1a202c;
  margin: 0;
  text-align: left;
  flex: 0 1 auto;
}

.create {
  position: static;
  transform: none;
  background-color: white;
  color: var(--secondary);
  border: 1px solid var(--secondary);
  padding: 10px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  margin: 0;
}

.create:hover {
  background-color: var(--secondary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(69, 123, 157, 0.3);
}

.commentsError {
  font-size: 1.1rem;
  color: #64748b;
  background: white;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 30px;
  margin: 20px auto;
  text-align: center;
  width: 100%;
  font-weight: 500;
}

.commentsError:hover {
  transform: none;
  background: white;
  color: #64748b;
  border-color: #cbd5e1;
  box-shadow: none;
}

.comments-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 24px;
  padding: 10px 4px 24px 4px; /* Space for shadow */
  width: 100%;
  box-sizing: border-box;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar Styling */
.comments-list::-webkit-scrollbar {
  height: 8px;
  background: transparent;
}

.comments-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.comment-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  min-width: 300px;
  max-width: 350px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.comment-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.comment-user {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
}

.comment-note {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f59e0b;
  background-color: #fffbeb;
  padding: 4px 8px;
  border-radius: 8px;
}

.comment-body {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
  flex-grow: 1; /* ensure consistant height */
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.delete-btn:hover {
  background-color: #fee2e2;
}

.delete-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-btn:hover .delete-icon {
  opacity: 1;
  transform: none;
  filter: none;
}

@media (max-width: 700px) {
  .comments-section {
    padding: 20px;
  }

  .comments-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }

  .title {
    text-align: center;
    font-size: 1.8rem;
  }

  .create {
    width: 100%;
  }

  .comments-list {
    flex-direction: row; /* Keep scrolling on mobile, better than huge stack */
    overflow-x: auto;
    padding-bottom: 20px;
  }

  .comment-card {
    min-width: 280px;
    max-width: 280px;
  }
}
</style>
