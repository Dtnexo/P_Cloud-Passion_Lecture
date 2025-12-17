<script setup>
import { onMounted, reactive, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import { useFlashMessageStore } from '@/stores/flashMessage'
import router from '@/router'

const book = reactive({
  image: null,
  preview: null,
  titre: '',
  resume: '',
  nb_pages: '',
  nom_editeur: '',
  user_fk: '',
  extrait: '',
  annee_edition: '',
})

const champs = {
  titre: true,
  resume: true,
  nb_pages: true,
  nom_editeur: true,
  user_fk: true,
  extrait: true,
  annee_edition: true,
  categorie: true,
  image: true,
  author: true,
}

const categories = ref([])
const authors = ref([])
onMounted(() => {
  ouvrageServices.getAllCategories().then((res) => {
    categories.value = res.data.data.map((cat) => {
      return {
        id: cat.categorie_id,
        nom: cat.nom,
      }
    })
  })

  ouvrageServices.getAllAuthors().then((res) => {
    authors.value = res.data.data.map((auth) => ({
      id: auth.ecrivain_id,
      nom: auth.prenom + ' ' + auth.nom,
    }))
  })
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    book.image = file

    if (book.preview) {
      URL.revokeObjectURL(book.preview)
    }
    book.preview = URL.createObjectURL(file)
  }
}

const open = ref(null)
const selected = ref({
  categorie: '',
  author: '',
})

const toggleSelect = (name) => {
  open.value = open.value === name ? null : name
}

const selectOption = (name, value) => {
  selected.value[name] = value
  open.value = null
}
const clickFilter = () => {
  if (open.value == 'categorie') {
    open.value = null
  }
}

const uploadImage = async () => {
  if (!book.image) {
    console.error('Aucune image sélectionnée.')
    return
  }

  const formData = new FormData()
  formData.append('image', book.image)

  try {
    const response = await ouvrageServices.uploadImage(formData)
    book.image = response.data.filePath
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image :", error)
  }
}

const flashMessageStore = useFlashMessageStore()

const checkValid = async () => {
  await uploadImage()
  const data = {
    titre: book.titre,
    image: book.image,
    nb_pages: Number(book.nb_pages),
    nom_editeur: book.nom_editeur,
    resume: book.resume,
    categorie_fk: Number(selected.value.categorie.id),
    extrait: book.extrait,
    annee_edition: book.annee_edition,
    ecrivain_fk: Number(selected.value.author.id),
  }
  if (!book.titre.trim()) {
    champs.titre = false
  } else {
    champs.titre = true
  }
  if (!selected.value.author) {
    champs.author = false
  } else {
    champs.author = true
  }
  if (!selected.value.categorie) {
    champs.categorie = false
  } else {
    champs.categorie = true
  }
  if (!book.resume.trim()) {
    champs.resume = false
  } else {
    champs.resume = true
  }
  if (!book.nb_pages) {
    champs.nb_pages = false
  } else {
    champs.nb_pages = true
  }
  if (!book.annee_edition) {
    champs.annee_edition = false
  } else {
    champs.annee_edition = true
  }
  if (!book.nom_editeur.trim()) {
    champs.nom_editeur = false
  } else {
    champs.nom_editeur = true
  }
  if (!book.extrait.trim()) {
    champs.extrait = false
  } else {
    champs.extrait = true
  }
  if (!book.image) {
    champs.image = false
  } else {
    champs.image = true
  }
  if (
    !book.titre.trim() ||
    !book.image ||
    !book.nb_pages ||
    !book.nom_editeur.trim() ||
    !book.resume.trim() ||
    !selected.value.categorie ||
    !book.extrait.trim() ||
    !selected.value.author ||
    !book.annee_edition
  ) {
    flashMessageStore.setFlashMessage('error', 'Veuillez remplir tous les champs obligatoires.')
    return false
  }
  if (
    champs.titre &&
    champs.image &&
    champs.nb_pages &&
    champs.nom_editeur &&
    champs.resume &&
    champs.categorie &&
    champs.extrait &&
    champs.author &&
    champs.annee_edition
  ) {
    flashMessageStore.setFlashMessage('success', 'Livre ajouté avec succès !')
    router.push({ name: 'ouvrages' })
    ouvrageServices.createBook(data).then((res) => {})
    return true
  }
}
</script>
<template>
  <div class="book-detail">
    <!-- Left Column: Cover Image -->
    <div class="left-column">
      <input type="file" id="fileInput" @change="handleFileUpload" accept="image/*" hidden />
      <label
        for="fileInput"
        :class="['uploadImage', { noBorder: book.preview }, { uploadImageError: !champs.image }]"
      >
        <img
          v-if="book.preview"
          :src="book.preview"
          alt="Image sélectionnée"
          class="uploadedImage"
        />
        <div v-else class="upload-placeholder">
          <div class="icon-circle">
            <img class="chooseImage" src="/images/ajouter-une-image.png" alt="upload" />
          </div>
          <span class="upload-text">Ajouter une couverture</span>
        </div>
      </label>
    </div>

    <!-- Right Column: Form -->
    <div class="form-column">
      <!-- Title -->
      <div class="form-group full-width">
        <label for="titre">Titre du livre</label>
        <input
          id="titre"
          type="text"
          v-model="book.titre"
          placeholder="Titre de l'œuvre"
          class="editable-input title-input"
          :class="{ 'editable-inputError': !champs.titre }"
        />
      </div>

      <!-- Row: Author & Category -->
      <div class="form-row">
        <div class="form-group half-width">
          <label>Auteur</label>
          <div
            class="author-select"
            @click.stop="toggleSelect('author')"
            :class="{ 'editable-inputError': !champs.author }"
          >
            <div class="selectedAuthor" :class="{ selectedAuthorerror: !champs.author }">
              {{ selected.author.nom || 'Sélectionner un auteur' }}
            </div>
            <ul
              class="optionsAuthor"
              v-show="open === 'author'"
              :class="{ optionsAuthorerror: !champs.author }"
            >
              <li
                v-for="author in authors"
                :key="author.id"
                @click.stop="selectOption('author', author)"
              >
                {{ author.nom }}
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group half-width">
          <label>Catégorie</label>
          <div
            class="custom-select"
            @click.stop="toggleSelect('categorie')"
            :class="{ 'custom-error': !champs.categorie }"
          >
            <div id="categorie" class="selected" :class="{ selectedError: !champs.categorie }">
              {{ selected.categorie.nom || 'Sélectionner une catégorie' }}
            </div>
            <ul
              class="options"
              v-show="open === 'categorie'"
              :class="{ optionsError: !champs.categorie }"
            >
              <li
                v-for="categorie in categories"
                :key="categorie.id"
                @click.stop="selectOption('categorie', categorie)"
              >
                {{ categorie.nom }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Row: Pages, Year, Editor -->
      <div class="form-row three-cols">
        <div class="form-group">
          <label for="nb_pages">Pages</label>
          <input
            id="nb_pages"
            type="number"
            v-model="book.nb_pages"
            placeholder="350"
            class="editable-input"
            :class="{ 'editable-inputError': !champs.nb_pages }"
          />
        </div>
        <div class="form-group">
          <label for="formattedDate">Année</label>
          <input
            id="formattedDate"
            type="date"
            v-model="book.annee_edition"
            class="editable-input"
            :class="{ 'editable-inputError': !champs.annee_edition }"
          />
        </div>
        <div class="form-group">
          <label for="nom_editeur">Éditeur</label>
          <input
            id="nom_editeur"
            type="text"
            v-model="book.nom_editeur"
            placeholder="Gallimard"
            class="editable-input"
            :class="{ 'editable-inputError': !champs.nom_editeur }"
          />
        </div>
      </div>

      <!-- Link -->
      <div class="form-group full-width">
        <label for="extrait">Lien extrait</label>
        <input
          id="extrait"
          type="text"
          v-model="book.extrait"
          placeholder="https://exemple.com/extrait.pdf"
          class="editable-input"
          :class="{ 'editable-inputError': !champs.extrait }"
        />
      </div>

      <!-- Resume -->
      <div class="form-group full-width grow-field">
        <label for="resume">Résumé</label>
        <textarea
          id="resume"
          v-model="book.resume"
          placeholder="De quoi parle ce livre ?"
          class="editable-textarea"
          :class="{ 'editable-inputError': !champs.resume }"
        ></textarea>
      </div>

      <!-- Submit -->
      <button class="valid" @click="checkValid">Publier le livre</button>
    </div>
  </div>
</template>

<style scoped>
/* Main Container - Compact Grid */
.book-detail {
  display: grid;
  grid-template-columns: 280px 1fr; /* Image narrower */
  gap: 40px;
  max-width: 1100px;
  margin: 20px auto;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  align-items: stretch;
  min-height: 500px; /* Minimal height constraint */
  border: 1px solid #f1f5f9;
}

/* Left Column - Image */
.left-column {
  display: flex;
  flex-direction: column;
}

.uploadImage {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  cursor: pointer;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploadImage:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-2px);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #94a3b8;
}

.icon-circle {
  width: 60px;
  height: 60px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.uploadImage:hover .icon-circle {
  transform: scale(1.1);
  background: #cbd5e1;
}

.chooseImage {
  width: 24px;
  opacity: 0.6;
}

.upload-text {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.uploadedImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploadImageError {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

/* Right Column - Compact Form */
.form-column {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Tighter gap */
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.half-width {
  flex: 1;
}

.three-cols {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

/* Inputs */
.editable-input,
.editable-textarea,
.author-select,
.custom-select {
  width: 100%;
  padding: 10px 14px; /* More compact padding */
  font-size: 0.95rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
  box-sizing: border-box;
  color: #1e293b;
  min-height: 42px; /* Fixed height for alignment */
  display: flex;
  align-items: center;
}

.title-input {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 12px 14px;
}

.editable-textarea {
  min-height: 80px; /* Smaller default height */
  resize: none; /* No resize to break layout */
  align-items: flex-start;
  font-family: inherit;
}

.grow-field {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.grow-field .editable-textarea {
  flex-grow: 1;
  height: 100%;
}

input:focus,
textarea:focus {
  outline: none;
  background: white;
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.2);
}

.editable-inputError {
  border-color: #ef4444 !important;
  background-color: #fff5f5 !important;
}

/* Custom Select Specifics */
.author-select,
.custom-select {
  cursor: pointer;
  position: relative;
}

.selectedAuthor,
.selected {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selectedAuthor::after,
.selected::after {
  content: '▼';
  font-size: 0.7rem;
  color: #94a3b8;
}

/* Dropdown Options */
.optionsAuthor,
.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  margin-top: 4px;
  padding: 4px 0;
  list-style: none;
}

.optionsAuthor li,
.options li {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #475569;
}

.optionsAuthor li:hover,
.options li:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* Submit Button */
.valid {
  margin-top: auto;
  padding: 14px 24px;
  background-color: #0f172a;
  color: white;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.valid:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
  background-color: #1e293b;
}

@media (max-width: 900px) {
  .book-detail {
    grid-template-columns: 1fr;
    height: auto;
  }
  .left-column {
    height: 300px;
  }
}
</style>
