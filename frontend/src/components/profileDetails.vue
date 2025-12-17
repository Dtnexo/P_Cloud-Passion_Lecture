<script setup>
import { onMounted, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'

const props = defineProps({
  userId: {
    required: true,
    type: Number,
  },
})

function formatDate(dateStr) {
  if (!dateStr) return 'Date inconnue'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Date inconnue'

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const user = ref({})

onMounted(() => {
  console.log('User ID:', props.userId)
  ouvrageServices
    .getUserById(props.userId)
    .then((data) => {
      user.value = data.data.utilisateur
      console.log('User data received:', user.value)
    })
    .catch((err) => {
      console.error(err)
    })
})
</script>

<template>
  <div class="profile-header">
    <div class="avatar-container">
      <img class="profile-avatar" src="/images/user-interfaceBlack.png" alt="Avatar utilisateur" />
    </div>
    <div class="user-info">
      <h2>{{ user.pseudo || 'Utilisateur' }}</h2>
      <p class="profile-date">
        Membre depuis le {{ formatDate(user.date_entre || user.createdAt) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  padding: 40px;
  margin: 40px auto;
  max-width: 800px;
}

.avatar-container {
  position: relative;
}

.avatar-container::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0 0%, white 100%);
  z-index: -1;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-header h2 {
  margin: 0;
  color: #1e293b;
  font-family: 'Georgia', serif;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.profile-date {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 30px;
    gap: 20px;
  }
}
</style>
