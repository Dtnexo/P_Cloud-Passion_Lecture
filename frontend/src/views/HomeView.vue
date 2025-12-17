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
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        La lecture prend vie, <br />
        <span class="text-gradient">partagez vos découvertes</span>
      </h1>
      <p class="hero-description">
        Bienvenue sur <strong>Lire & Partager</strong>. Explorez de nouveaux univers, notez vos
        coups de cœur et échangez avec une communauté de passionnés. Votre prochaine grande aventure
        commence ici.
      </p>
      <div class="hero-actions">
        <RouterLink to="/ouvrages" class="btn-primary">Explorer les livres</RouterLink>
      </div>
    </div>
    <div class="hero-visual">
      <div class="image-wrapper">
        <img src="/images/Image_accueil.png" alt="Bibliothèque accueillante" />
      </div>
    </div>
  </section>

  <main>
    <div class="section-header">
      <h2 class="section-title">Les dernières nouveautés</h2>
      <p class="section-subtitle">Découvrez les ajouts les plus récents de la communauté</p>
    </div>

    <section class="books-container">
      <div class="books-grid">
        <booksCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 60px;
  padding: 60px 0 100px;
  min-height: 80vh;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--primary);
  margin: 0;
}

.text-gradient {
  background: linear-gradient(120deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-description {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--text-light);
  max-width: 90%;
}

.hero-actions {
  margin-top: 10px;
}

.btn-primary {
  display: inline-block;
  background-color: var(--secondary);
  color: white;
  padding: 14px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(69, 123, 157, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(69, 123, 157, 0.4);
  background-color: #3b6b8c;
}

/* Hero Visual */
.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 550px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
  transition: transform 0.5s ease;
}

.image-wrapper:hover {
  transform: perspective(1000px) rotateY(0) rotateX(0);
}

.image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
}

/* Latest Books Section */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 2.5rem;
  color: var(--primary);
  margin: 0 0 12px;
}

.section-subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
}

.books-container {
  padding-bottom: 80px;
  display: flex;
  justify-content: center;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Force 3 columns */
  gap: 40px;
  width: 100%;
  max-width: 1000px; /* Constrain width to keep cards nice */
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 968px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
    padding: 40px 0;
  }

  .hero-content {
    align-items: center;
  }

  .hero-description {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .image-wrapper {
    transform: none;
    max-width: 100%;
  }
}

@media (max-width: 850px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 cols on tablet */
    max-width: 600px;
  }
}

@media (max-width: 550px) {
  .books-grid {
    grid-template-columns: 1fr; /* 1 col on mobile */
  }
}
</style>
