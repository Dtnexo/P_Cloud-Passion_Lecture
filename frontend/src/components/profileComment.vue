<script setup>
import { onMounted, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import confirmation from './confirmation.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const DB_URL = import.meta.env.VITE_DB_URL

const props = defineProps({
  userId: {
    required: true,
    type: [Number, String],
  },
})

const fetchComments = () => {
  ouvrageServices
    .getUserComments(props.userId)
    .then((res) => {
      const comments = res.data.data || []

      const commentsByBook = {}

      for (const comment of comments) {
        if (!commentsByBook[comment.ouvrage_fk]) commentsByBook[comment.ouvrage_fk] = []
        commentsByBook[comment.ouvrage_fk].push(comment)
      }

      if (Object.keys(commentsByBook).length === 0) {
        bookComments.value = []
        return
      }

      const promises = Object.keys(commentsByBook).map((ouvrageId) => {
        return ouvrageServices.getBookById(ouvrageId).then((bookRes) => ({
          book: bookRes.data.ouvrage,
          comments: commentsByBook[ouvrageId],
        }))
      })

      Promise.all(promises)
        .then((results) => {
          bookComments.value = results
        })
        .catch((err) => {
          console.error(err)
        })
    })
    .catch((err) => {
      console.error(err)
    })
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
const deleteConfirmation = ref(false)

const deleteComment = async (id) => {
  deleteConfirmation.value = false
  try {
    await ouvrageServices.deleteComment(id)
    await fetchComments()
  } catch (err) {
    console.error(err)
  }
}

// Formatage de la date
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const bookComments = ref([])

onMounted(() => {
  if (props.userId) {
    fetchComments()
  }
})
function goToBook(ouvrageId) {
  router.push(`/ouvrages/${ouvrageId}`)
}
const comment = true
</script>

<template>
  <div class="profile-section">
    <h3 class="profile-title">
      Commentaires postés
      <span class="count"
        >({{ bookComments.reduce((acc, bc) => acc + bc.comments.length, 0) }})</span
      >
    </h3>

    <div class="comments-grid">
      <div class="comment-clean-card" v-for="bc in bookComments" :key="bc.book.ouvrage_id">
        <div class="card-header" @click="goToBook(bc.book.ouvrage_id)">
          <img :src="`${DB_URL}${bc.book.image}`" alt="Cover" class="mini-cover" />
          <h4>{{ bc.book.titre }}</h4>
        </div>

        <div class="comments-list">
          <div v-for="comment in bc.comments" :key="comment.evaluation_id" class="comment-item">
            <div class="comment-top">
              <span class="note">★ {{ comment.note }}/5</span>
              <span class="date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="comment-content">"{{ comment.commentaire }}"</p>
            <button
              class="delete-btn"
              @click.stop="showConfirmationDelete(comment.evaluation_id, comment.commentaire)"
              title="Supprimer"
            >
              <img src="/images/trash-canRed.png" alt="Supprimer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <confirmation
    v-show="deleteConfirmation"
    :titre="commentaireValue.titre"
    :comment="comment"
    @confirm="deleteComment(commentId)"
    @cancel="hideConfirmationDelete"
  />
</template>

<style scoped>
.profile-section {
  margin: 40px auto;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
}

.profile-title {
  color: #1e293b;
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-family: 'Georgia', serif;
  font-weight: 700;
  text-align: left;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 16px;
}

.count {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: normal;
  font-family: 'Inter', sans-serif;
}

.comments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
}

.comment-clean-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.comment-clean-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f8fafc;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
}

.mini-cover {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #334155;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comments-list {
  padding: 16px;
}

.comment-item {
  position: relative;
  background: white;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.note {
  color: #fbbf24;
  font-weight: 700;
}

.date {
  color: #94a3b8;
}

.comment-content {
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
  font-style: italic;
  line-height: 1.5;
  padding-right: 24px;
}

.delete-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
  padding: 0;
}

.delete-btn:hover {
  opacity: 1;
}

.delete-btn img {
  width: 18px;
  height: 18px;
}

@media (max-width: 600px) {
  .comments-grid {
    grid-template-columns: 1fr;
  }
}
</style>
