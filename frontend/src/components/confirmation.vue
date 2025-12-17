<script setup>
const props = defineProps({
  titre: {
    required: true,
    type: String,
  },
  comment: {
    required: true,
    type: Boolean,
  },
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <div class="icon-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          ></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>

      <h1>Êtes-vous sûr ?</h1>
      <p class="message">
        Vous êtes sur le point de supprimer
        <span v-show="comment">votre commentaire :</span>
        <br />
        <strong class="highlight">"{{ titre }}"</strong>
        <br />
        <span class="warning-text">Cette action est irréversible.</span>
      </p>

      <div class="modal-actions">
        <button class="btn cancel" @click="$emit('cancel')">Annuler</button>
        <button class="btn confirm" @click="$emit('confirm')">Supprimer</button>
      </div>
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
  backdrop-filter: blur(8px);
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
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow:
    0 20px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Warning Icon */
.icon-container {
  width: 80px;
  height: 80px;
  background-color: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  margin-bottom: 5px;
  animation: pulse 2s infinite;
}

/* Typography */
h1 {
  font-family: 'Georgia', serif;
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0;
}

.message {
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.highlight {
  color: #1e293b;
  font-weight: 700;
  font-style: italic;
  display: block;
  margin: 8px 0;
}

.warning-text {
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
}

.btn {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  max-width: 140px;
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
  background-color: #dc2626;
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

.confirm:hover {
  transform: translateY(-2px);
  background-color: #b91c1c;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);
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

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.2);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

/* Mobile */
@media (max-width: 600px) {
  .modal-content {
    padding: 30px 20px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    max-width: none;
  }
}
</style>
