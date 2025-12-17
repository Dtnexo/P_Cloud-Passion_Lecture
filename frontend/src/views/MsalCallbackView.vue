<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const token = route.query.token
  if (token) {
    // Stocker le token comme le ferait la connexion classique
    localStorage.setItem('token', `Bearer ${token}`)
    // Rediriger vers la page des ouvrages ou profil
    router.push('/ouvrages')
  } else {
    // Si pas de token, retour au login avec erreur
    router.push('/login?error=missing_token')
  }
})
</script>

<template>
  <div class="callback-container">
    <p>Connexion en cours...</p>
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-top: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
