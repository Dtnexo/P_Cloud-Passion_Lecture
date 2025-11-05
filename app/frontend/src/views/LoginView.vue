<script setup>
import ouvrageServices from '../../services/ouvrageServices'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const pseudo = ref('')
const mdp = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    await ouvrageServices.login({ pseudo: pseudo.value, mdp: mdp.value })
    router.push('/ouvrages')
  } catch (e) {
    error.value = "Nom d'utilisateur ou mot de passe incorrect"
  }
}


const msLogin = () => {
  window.location.href = '/auth/microsoft/login'
}
</script>

<template>
  <div class="login-center">
    <form @submit.prevent="handleLogin">
      <label for="Username">Username: </label>
      <input
        type="text"
        required
        id="Username"
        name="username"
        placeholder="Entrer le nom d'utilisateur"
        v-model="pseudo"
      />
      <label for="Password">Password: </label>
      <input
        type="password"
        required
        id="Password"
        name="password"
        placeholder="Entrer le mot de passe"
        v-model="mdp"
      />
      <input type="submit" value="Submit" />
      <button @click="msLogin" type="button">
        Se connecter avec Microsoft
        <img src="../../public/images/logoMircosoft.png" alt="image de couverture" />
      </button>
      <p v-if="error" style="color: red">{{ error }}</p>
      <p>
        Pas encore de compte ?
        <a href="/register">Créer un compte</a>
      </p>
    </form>
  </div>
</template>

<style scoped>
.login-center {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
form {
  max-width: 400px;
  margin: 0 auto;
  padding: 32px 28px 28px 28px;
  background: #f7fbfc;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(69, 123, 157, 0.1);
  display: flex;
  flex-direction: column;
  gap: 18px;
  border: 1.5px solid #a3cef1;
}

form label {
  font-weight: 600;
  color: #1d3557;
  margin-bottom: 6px;
  font-size: 16px;
  letter-spacing: 0.5px;
}

form input[type='text'],
form input[type='password'] {
  padding: 11px 14px;
  border: 1.5px solid #bcdff1;
  border-radius: 7px;
  font-size: 16px;
  background: #fff;
  color: #1d3557;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

form input[type='text']:focus,
form input[type='password']:focus {
  outline: none;
  border-color: #457b9d;
  box-shadow: 0 0 0 3px rgba(69, 123, 157, 0.13);
}

form input[type='submit'] {
  background: linear-gradient(90deg, #457b9d 0%, #1d3557 100%);
  color: #fff;
  font-weight: 700;
  padding: 13px 0;
  border: none;
  border-radius: 7px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 8px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(69, 123, 157, 0.1);
  transition: background 0.3s;
}

form input[type='submit']:hover {
  background: linear-gradient(90deg, #6096ba 0%, #457b9d 100%);
}

form button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: linear-gradient(90deg, #0078d4 0%, #005a9e 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(2, 90, 204, 0.14);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
  -webkit-tap-highlight-color: transparent;
}

form button img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  border-radius: 3px;
}
form button {
  gap: 8px;
}

form button:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(2, 90, 204, 0.18);
  opacity: 0.98;
}

form button:active {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(2, 90, 204, 0.12);
}

form button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.12);
}

/* Si tu veux ajouter une icône à gauche du texte */
form button .ms-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
}

/* Respecter les préférences de réduction d'animations */
@media (prefers-reduced-motion: reduce) {
  form button {
    transition: none;
    transform: none;
  }
}

p {
  text-align: center;
  font-size: 15px;
  color: #1d3557;
}

p a {
  color: #457b9d;
  text-decoration: none;
  font-weight: 700;
  padding-left: 4px;
  transition: color 0.2s;
}

p a:hover {
  color: #1d3557;
  text-decoration: underline;
}

p[style] {
  margin-top: 12px;
  font-weight: 600;
  color: #e63946 !important;
  text-align: center;
  letter-spacing: 0.2px;
  background: #fff0f3;
  border-radius: 6px;
  padding: 7px 0;
}
</style>
