<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})
const DB_URL = import.meta.env.VITE_DB_URL
const link = computed(() => `/ouvrages/${props.book.ouvrage.ouvrage_id}`)
</script>

<template>
  <RouterLink :to="link" class="card">
    <div class="image-container">
      <img
        :src="`${DB_URL}${props.book.ouvrage.image}`"
        alt="image de couverture du livre"
        loading="lazy"
      />
    </div>
    <div class="card-content">
      <div class="titre">
        <p>{{ props.book.ouvrage.titre }}</p>
      </div>
      <div class="meta-info">
        <p class="ecrivain">{{ props.book.écrivain }}</p>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  border-radius: 16px;
  background-color: var(--surface);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* Fill the grid cell */
  text-decoration: none;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.5); /* Subtle border for glass effect hint */
  isolation: isolate;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card:hover::before {
  opacity: 1;
}

.image-container {
  width: 100%;
  aspect-ratio: 2/3; /* Standard book ratio */
  position: relative;
  overflow: hidden;
  background-color: #f1f5f9;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .image-container img {
  transform: scale(1.08);
}

/* Overlay gradient on image for text contrast/depth if needed, simpler for now */
.image-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card:hover .image-container::after {
  opacity: 1;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.titre {
  width: 100%;
  margin-bottom: 8px;
}

.titre p {
  font-family: var(--font-main);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.card:hover .titre p {
  color: var(--secondary);
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ecrivain {
  font-size: 0.95rem;
  color: var(--text-light);
  margin: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ecrivain::before {
  content: '';
  display: block;
  width: 20px;
  height: 1px;
  background-color: var(--secondary);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .card-content {
    padding: 16px;
  }

  .titre p {
    font-size: 1.1rem;
  }
}
</style>
