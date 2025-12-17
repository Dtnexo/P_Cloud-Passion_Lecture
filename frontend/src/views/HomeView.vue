<script setup>
import booksCard from '@/components/booksCard.vue'
import ouvrageServices from '../../services/ouvrageServices'
import { onMounted, ref } from 'vue'

const books = ref([])

onMounted(() => {
  ouvrageServices
    .getAllBooks()
    .then((response) => {
      const sortedBooks = response.data.data.sort(
        (a, b) => new Date(b.ouvrage.createdAt) - new Date(a.ouvrage.createdAt),
      )
      books.value = sortedBooks.slice(0, 6)
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des livres :', error)
    })
})
</script>

<template>
  <section class="hero">
    <h1 class="hero-title">La lecture prend vie, partagez vos découvertes !</h1>
    <img src="../../public/images/Image_accueil.png" alt="image d'accueil" class="hero-image" />
    <div class="hero-description">
      <h2>Bienvenue sur <span class="highlight">Lire & Partager</span> !</h2>
      <p>
        Découvrez un espace dédié aux amoureux des livres ! Sur Lire & Partager, vous pouvez
        explorer de nouveaux ouvrages, partager vos lectures préférées et interagir avec d'autres
        passionnés. Notre plateforme vous permet de découvrir, noter et commenter les livres que
        vous aimez, tout en contribuant à une communauté active de lecteurs.
      </p>
    </div>
  </section>

  <main>
    <h2 class="nouveauté">Les dernières nouveautés</h2>
    <section class="books-container">
      <div class="books">
        <booksCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Hero Section */
.hero {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, var(--background) 0%, #e2e8f0 100%);
  border-radius: var(--radius);
  margin-bottom: 50px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(69, 123, 157, 0.05) 0%, transparent 70%);
  z-index: 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: var(--primary);
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

.hero-image {
  max-width: 90%;
  width: 600px;
  height: auto;
  border-radius: 20px;
  margin: 30px 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: rotate(-1deg);
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.hero-image:hover {
  transform: rotate(0deg) scale(1.02);
}

.hero-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-main);
  position: relative;
  z-index: 1;
}

.hero-description h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--secondary);
  font-weight: 700;
}

.highlight {
  color: var(--secondary);
  font-weight: 800;
  position: relative;
  border-bottom: 3px solid rgba(69, 123, 157, 0.2);
}

/* Latest Books Section */
.nouveauté {
  text-align: center;
  font-size: 2rem;
  color: var(--primary);
  margin: 60px 0 40px;
  font-weight: 800;
  position: relative;
  display: inline-block;
  width: 100%;
}

.nouveauté::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: var(--accent);
  margin: 10px auto 0;
  border-radius: 2px;
}

.books-container {
  width: 100%;
  padding: 0 10px;
}

.books {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  justify-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 40px 15px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-image {
    width: 100%;
  }

  .hero-description {
    font-size: 1rem;
  }
}
</style>
