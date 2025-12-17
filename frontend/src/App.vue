<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, computed, onMounted, reactive } from 'vue'
import router from './router'

const showPopup = ref(false)

const isLogged = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return false
  const jwt = token.split(' ')[1]
  let userId
  let admin
  try {
    userId = JSON.parse(atob(jwt.split('.')[1])).userId
    admin = JSON.parse(atob(jwt.split('.')[1])).admin
    return true
  } catch (e) {
    return false
  }
})

const isAdmin = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return false
  try {
    const jwt = token.split(' ')[1]
    const admin = JSON.parse(atob(jwt.split('.')[1])).admin
    return admin === true
  } catch (e) {
    return false
  }
})

function togglePopup() {
  showPopup.value = !showPopup.value
}

function closePopup() {
  showPopup.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!(e.target.closest('.login-link') || e.target.closest('.user-popup'))) {
      showPopup.value = false
    }
  })
})

const logout = async () => {
  localStorage.removeItem('token')
  console.log('Déconnexion réussie')
  showPopup.value = false
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <header>
      <div class="container">
        <a href="/">
          <img src="/images/passionLecture.png" alt="Logo Passion Lecture" />
        </a>
        <nav>
          <RouterLink class="navigation" to="/">Home</RouterLink>
          <RouterLink class="navigation" to="/ouvrages">Ouvrages</RouterLink>
          <RouterLink v-if="isAdmin" class="navigation" to="/admin">Admin</RouterLink>
        </nav>
        <div class="login-link" @click.stop="togglePopup">
          <img class="login-img" src="/images/user-interfaceBlack.png" alt="login" />
          <div v-if="showPopup" class="user-popup">
            <RouterLink @click.stop="closePopup" v-if="isLogged" to="/profile"
              >Mon profil</RouterLink
            >
            <RouterLink class="logout" to="/login" @click.stop="logout" v-if="isLogged"
              >Déconnexion</RouterLink
            >
            <RouterLink v-else to="/login" @click.stop="closePopup">Connexion</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <RouterView />
    </div>

    <footer class="footer">
      <div class="container footer-container">
        <div class="footer-logo">
          <img src="/images/passionLecture.png" alt="Logo Passion Lecture" />
        </div>
        <div class="footer-center">
          <a class="footer-contact" href="mailto:pt22ugm@eduvaud.ch">Contact</a>
          <p class="footer-credits">
            &copy; 2025 Passion Lecture. Tous droits réservés.<br />
            Evan · Diego · Mathieu
          </p>
        </div>
        <div class="footer-empty"></div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global Variables & Reset */
:root {
  --primary: #1d3557;
  --secondary: #457b9d;
  --accent: #e63946;
  --background: #f8fafe;
  --surface: #ffffff;
  --text-main: #2b2d42;
  --text-light: #6c757d;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  --radius: 12px;
  --font-main: 'Inter', system-ui, -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-main);
  background-color: var(--background);
  color: var(--text-main);
  line-height: 1.6;
}

a {
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  padding-top: 100px; /* Offset for fixed header */
}

/* Navbar */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container img {
  height: 40px;
  width: auto;
}

nav {
  display: flex;
  gap: 10px;
  align-items: center;
}

.navigation {
  font-weight: 600;
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: 8px;
  position: relative;
}

.navigation:hover,
.navigation.router-link-active {
  color: var(--secondary);
  background: rgba(69, 123, 157, 0.1);
}

/* User Menu */
.login-link {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.login-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.login-link:hover .login-img {
  border-color: var(--secondary);
  transform: scale(1.05);
}

.user-popup {
  position: absolute;
  top: 50px;
  right: 0;
  background: var(--surface);
  border-radius: 12px;
  padding: 10px;
  width: 180px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 5px;
  animation: slideIn 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.user-popup a {
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  color: var(--text-main);
}

.user-popup a:hover {
  background: var(--background);
  color: var(--secondary);
}

.user-popup .logout {
  color: var(--accent);
}

.user-popup .logout:hover {
  background: #fff5f5;
  color: #c0392b;
}

/* Footer */
.footer {
  background: var(--surface);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 40px 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.footer-logo img {
  height: 30px;
  opacity: 0.8;
}

.footer-center {
  text-align: center;
}

.footer-contact {
  font-weight: 600;
  color: var(--secondary);
}

.footer-credits {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 5px;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding-top: 80px;
  }

  .container {
    padding: 10px 15px;
  }

  nav {
    display: none; /* Mobile menu implementation usually requires state, assume handled or just hide for now based on snippet */
  }

  /* Simple mobile nav override if no burger menu logic exists in template */
  nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: var(--surface);
    display: flex;
    justify-content: space-around;
    padding: 10px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 999;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* Reset footer layout for mobile */
  .footer-container {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
