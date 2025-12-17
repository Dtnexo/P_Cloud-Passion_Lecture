<script setup>
import { ref } from 'vue'

const emit = defineEmits(['confirm', 'cancel'])

const commentaire = ref('')
const note = ref(5)
const hoverNote = ref(0) // For hover effect on stars

const submitComment = () => {
  if (commentaire.value.trim() && note.value) {
    emit('confirm', { commentaire: commentaire.value, note: note.value })
    // Reset handled by parent or component re-mount, but safe to clear here
    commentaire.value = ''
    note.value = 5
  }
}

const setNote = (n) => {
  note.value = n
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <div class="modal-header">
        <h1>Votre avis compte</h1>
        <p class="subtitle">Partagez votre expérience de lecture</p>
      </div>

      <form class="comment-form" @submit.prevent="submitComment">
        <!-- Star Rating -->
        <div class="form-group">
          <label>Quelle note donnez-vous ?</label>
          <div class="star-rating" @mouseleave="hoverNote = 0">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= (hoverNote || note) }"
              @click="setNote(n)"
              @mouseover="hoverNote = n"
            >
              ★
            </span>
          </div>
          <span class="rating-text" v-if="note > 0">
            {{ note }}/5 - <span v-if="note === 5">Excellent !</span>
            <span v-else-if="note === 4">Très bon</span>
            <span v-else-if="note === 3">Bien</span>
            <span v-else-if="note === 2">Moyen</span>
            <span v-else>Pas terrible</span>
          </span>
        </div>

        <!-- Comment -->
        <div class="form-group">
          <label for="commentaire">Votre commentaire</label>
          <textarea
            id="commentaire"
            v-model="commentaire"
            rows="5"
            placeholder="Ce livre m'a transporté..."
            required
            class="premium-input"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn cancel" type="button" @click="$emit('cancel')">Annuler</button>
          <button class="btn confirm" type="submit">Publier</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px); /* Glass blur effect */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

/* Modal Card */
.modal-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 24px;
  max-width: 550px;
  width: 90%;
  text-align: center;
  box-shadow:
    0 20px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.modal-header h1 {
  font-family: 'Georgia', serif;
  font-size: 2rem;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* Form */
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

/* Star Rating */
.star-rating {
  display: flex;
  gap: 8px;
  font-size: 2rem;
  cursor: pointer;
}

.star {
  color: #e2e8f0;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  user-select: none;
}

.star.filled {
  color: #fbbf24;
  transform: scale(1.1);
  text-shadow: 0 2px 10px rgba(251, 191, 36, 0.4);
}

.star:hover {
  transform: scale(1.2);
}

.rating-text {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
  margin-top: -5px;
}

/* Input */
.premium-input {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #334155;
  transition: all 0.2s;
  resize: none;
  box-sizing: border-box;
}

.premium-input:focus {
  outline: none;
  background: white;
  border-color: #94a3b8;
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.1);
}

.premium-input::placeholder {
  color: #cbd5e1;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn {
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel {
  background-color: transparent;
  color: #64748b;
}

.cancel:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.confirm {
  background-color: #0f172a;
  color: white;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  min-width: 120px;
}

.confirm:hover {
  transform: translateY(-2px);
  background-color: #1e293b;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mobile */
@media (max-width: 600px) {
  .modal-content {
    padding: 24px;
    width: 95%;
  }

  .star-rating {
    justify-content: center;
  }

  .form-group {
    align-items: center;
  }

  label {
    align-self: flex-start;
  }
}
</style>
