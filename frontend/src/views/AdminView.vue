<script setup>
import { ref, onMounted } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
// import { useFlashMessageStore } from '@/stores/flashMessage' // Removed as it was causing issues in some contexts, using local state or standard alerting might be simpler for now, but keeping store usage if it works.
import { useFlashMessageStore } from '@/stores/flashMessage'

const activeTab = ref('users')
const users = ref([])
const books = ref([])
const evaluations = ref([])
const flashMessageStore = useFlashMessageStore()

// Icons as SVG strings
const icons = {
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  books: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  comments: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
}

// Fetch data on mount
onMounted(() => {
  fetchUsers()
  fetchBooks()
  fetchEvaluations()
})

const fetchUsers = () => {
  ouvrageServices
    .getAllUsers()
    .then((res) => (users.value = res.data.data))
    .catch((err) => console.error(err))
}

const fetchBooks = () => {
  ouvrageServices
    .getAllBooks()
    .then((res) => (books.value = res.data.data))
    .catch((err) => console.error(err))
}

const fetchEvaluations = () => {
  ouvrageServices
    .getAllEvaluations()
    .then((res) => (evaluations.value = res.data.data))
    .catch((err) => console.error(err))
}

const deleteUser = (id) => {
  if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
    ouvrageServices
      .deleteUser(id)
      .then(() => {
        flashMessageStore.setFlashMessage('success', 'Utilisateur supprimé')
        fetchUsers()
      })
      .catch((err) => flashMessageStore.setFlashMessage('error', 'Erreur lors de la suppression'))
  }
}

const deleteBook = (id) => {
  if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
    ouvrageServices
      .deleteBook(id)
      .then(() => {
        flashMessageStore.setFlashMessage('success', 'Livre supprimé')
        fetchBooks()
      })
      .catch((err) => flashMessageStore.setFlashMessage('error', 'Erreur lors de la suppression'))
  }
}

const deleteEvaluation = (id) => {
  if (confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
    ouvrageServices
      .deleteComment(id)
      .then(() => {
        flashMessageStore.setFlashMessage('success', 'Commentaire supprimé')
        fetchEvaluations()
      })
      .catch((err) => flashMessageStore.setFlashMessage('error', 'Erreur lors de la suppression'))
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Tableau de bord Admin</h1>
      <p>Gérez les utilisateurs, les ouvrages et les commentaires depuis cet espace.</p>
    </div>

    <div v-if="flashMessageStore.type" :class="['flash-message', flashMessageStore.type]">
      {{ flashMessageStore.message }}
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
          <span class="icon" v-html="icons.users"></span>
          Utilisateurs
        </button>
        <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
          <span class="icon" v-html="icons.books"></span>
          Livres
        </button>
        <button :class="{ active: activeTab === 'evaluations' }" @click="activeTab = 'evaluations'">
          <span class="icon" v-html="icons.comments"></span>
          Commentaires
        </button>
      </div>
    </div>

    <!-- Content Sections -->
    <transition name="fade" mode="out-in">
      <!-- Users Section -->
      <div v-if="activeTab === 'users'" class="section" key="users">
        <div class="section-header">
          <h2>
            <span class="icon-large" v-html="icons.users"></span> Gestion des Utilisateurs ({{
              users.length
            }})
          </h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pseudo</th>
                <th>Inscrit le</th>
                <th class="text-center">Admin</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user_id">
                <td>#{{ user.user_id }}</td>
                <td class="font-bold">{{ user.pseudo }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td class="text-center">
                  <span v-if="user.admin" v-html="icons.check" title="Admin"></span>
                  <span v-else v-html="icons.x" title="Utilisateur"></span>
                </td>
                <td class="text-center">
                  <button
                    v-if="!user.admin"
                    class="btn-delete"
                    @click="deleteUser(user.user_id)"
                    title="Supprimer l'utilisateur"
                  >
                    <span v-html="icons.trash"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Books Section -->
      <div v-else-if="activeTab === 'books'" class="section" key="books">
        <div class="section-header">
          <h2>
            <span class="icon-large" v-html="icons.books"></span> Gestion des Livres ({{
              books.length
            }})
          </h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Catégorie</th>
                <th>Ajouté par</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book.ouvrage.ouvrage_id">
                <td class="font-bold text-primary">{{ book.ouvrage.titre }}</td>
                <td>{{ book.écrivain }}</td>
                <td>
                  <span class="badge">{{ book.categorie || 'N/A' }}</span>
                </td>
                <td>Utilisateur #{{ book.ouvrage.user_fk }}</td>
                <td class="text-center">
                  <button
                    class="btn-delete"
                    @click="deleteBook(book.ouvrage.ouvrage_id)"
                    title="Supprimer le livre"
                  >
                    <span v-html="icons.trash"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Evaluations Section -->
      <div v-else-if="activeTab === 'evaluations'" class="section" key="evaluations">
        <div class="section-header">
          <h2>
            <span class="icon-large" v-html="icons.comments"></span> Gestion des Commentaires ({{
              evaluations.length
            }})
          </h2>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Livre</th>
                <th>Note</th>
                <th>Commentaire</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="evaluation in evaluations" :key="evaluation.evaluations.evaluation_id">
                <td class="font-bold">{{ evaluation.ouvrage || 'Livre inconnu' }}</td>
                <td>
                  <span class="stars" :style="{ '--rating': evaluation.evaluations.note }">
                    <span
                      v-for="n in 5"
                      :key="n"
                      :class="{ filled: n <= evaluation.evaluations.note }"
                      >★</span
                    >
                  </span>
                </td>
                <td>
                  <div class="comment-bubble">
                    {{ evaluation.evaluations.commentaire }}
                  </div>
                </td>
                <td class="text-center">
                  <button
                    class="btn-delete"
                    @click="deleteEvaluation(evaluation.evaluations.evaluation_id)"
                    title="Supprimer le commentaire"
                  >
                    <span v-html="icons.trash"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 80vh;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #2c3e50;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #1d3557;
  margin-bottom: 10px;
  font-weight: 800;
}

.dashboard-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.flash-message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 50px;
  color: white;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}
.flash-message.success {
  background-color: #2ecc71;
}
.flash-message.error {
  background-color: #e74c3c;
}

/* Tabs Styling */
.tabs-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.tabs {
  display: inline-flex;
  background-color: #f1f3f5;
  border-radius: 12px;
  padding: 6px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6c757d;
  transition: all 0.3s ease;
}

.tabs button .icon {
  display: flex;
  align-items: center;
}

.tabs button:hover {
  color: #457b9d;
}

.tabs button.active {
  background-color: white;
  color: #1d3557;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Section Styling */
.section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  border: 1px solid #e9ecef;
}

.section-header {
  margin-bottom: 25px;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 15px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #457b9d;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-large svg {
  width: 28px;
  height: 28px;
}

/* Table Styling */
.table-responsive {
  overflow-x: auto;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

th {
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  padding: 16px;
  border-bottom: 2px solid #e9ecef;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f1f3f5;
  vertical-align: middle;
  color: #495057;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background-color: #f8f9fa;
}

.text-center {
  text-align: center;
}
.font-bold {
  font-weight: 600;
}
.text-primary {
  color: #1d3557;
}

/* Badges & Elements */
.badge {
  background-color: #e7f5ff;
  color: #1c7ed6;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.stars {
  color: #dee2e6;
  font-size: 1.1rem;
}

.stars .filled {
  color: #f1c40f;
}

.comment-bubble {
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 0 12px 12px 12px;
  font-size: 0.9rem;
  max-width: 400px;
  line-height: 1.4;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

/* Action Buttons */
.btn-delete {
  background-color: #fff5f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background-color: #e74c3c;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.2);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 20px 10px;
  }

  .tabs {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .tabs button {
    flex: 1;
    justify-content: center;
    padding: 10px;
    font-size: 0.85rem;
  }

  .section {
    padding: 15px;
  }

  .comment-bubble {
    font-size: 0.85rem;
  }
}
</style>
