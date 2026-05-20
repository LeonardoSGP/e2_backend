<template>
  <AppLayout>
    <div class="mi-perfil-page">

      <!-- Breadcrumb -->
      <div class="page-header">
        <h2 class="page-title">Mi Perfil</h2>
        <nav class="breadcrumb">
          <router-link to="/juez/dashboard" class="breadcrumb-link">Dashboard</router-link>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">Perfil</span>
        </nav>
      </div>

      <!-- Alert Messages -->
      <div v-if="successMsg" class="alert alert-success">
        <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        {{ successMsg }}
      </div>
      <div v-if="errorMsg" class="alert alert-error">
        <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        {{ errorMsg }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading"><div class="spinner"></div></div>

      <template v-else>
        <!-- ═══ PROFILE CARD ═══ -->
        <div class="profile-card">
          <div class="profile-card-inner">
            <!-- Avatar -->
            <div class="avatar-wrapper">
              <div class="avatar-circle-outer">
                <div class="avatar-circle">
                  <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" @error="avatarUrl = ''" />
                  <span v-else class="avatar-initials">{{ initials }}</span>
                </div>
                <!-- Pencil button -->
                <button @click="triggerFileInput" class="avatar-edit-btn" title="Cambiar foto de perfil">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <!-- Hidden file input -->
                <input type="file" ref="fileInput" class="hidden-file-input" accept="image/jpeg,image/png,image/jpg" @change="uploadAvatar" />
              </div>
            </div>
            <!-- Info -->
            <div class="profile-info">
              <h3 class="profile-name">{{ user.name }}</h3>
              <p class="profile-email">{{ user.email }}</p>
              <!-- Role Badges -->
              <div class="role-badges">
                <span v-for="role in user.roles" :key="role" class="role-badge">
                  {{ role }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ FORMS GRID ═══ -->
        <div class="forms-grid">

          <!-- 1. Personal Info -->
          <div class="form-card">
            <div class="form-card-header">
              <h3 class="form-card-title">Información Personal</h3>
            </div>
            <div class="form-card-body">
              <p class="form-description">Actualiza la información de tu perfil y dirección de correo electrónico.</p>
              <form @submit.prevent="handleUpdateProfile">
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Nombre Completo</label>
                    <input v-model="profileForm.name" type="text" class="form-input" required
                      pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" title="Solo letras y espacios" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Correo Electrónico</label>
                    <input v-model="profileForm.email" type="email" class="form-input" required />
                  </div>
                </div>
                <div class="form-actions">
                  <span v-if="profileSaved" class="saved-indicator"> Guardado correctamente.</span>
                  <button type="submit" class="btn-primary" :disabled="savingProfile">
                    {{ savingProfile ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- 2. Password -->
          <div class="form-card">
            <div class="form-card-header">
              <h3 class="form-card-title">Actualizar Contraseña</h3>
            </div>
            <div class="form-card-body">
              <p class="form-description">Asegúrese de que su cuenta utilice una contraseña larga y aleatoria para mantener su seguridad.</p>
              <form @submit.prevent="handleUpdatePassword">
                <div class="form-stack">
                  <div class="form-group">
                    <label class="form-label">Contraseña Actual</label>
                    <input v-model="passwordForm.current_password" type="password" class="form-input" required autocomplete="current-password" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Contraseña Nueva</label>
                    <input v-model="passwordForm.password" type="password" class="form-input" required minlength="8" autocomplete="new-password" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Confirmar Contraseña</label>
                    <input v-model="passwordForm.password_confirmation" type="password" class="form-input" required autocomplete="new-password" />
                  </div>
                </div>
                <div class="form-actions">
                  <span v-if="passwordSaved" class="saved-indicator"> Contraseña actualizada.</span>
                  <button type="submit" class="btn-primary" :disabled="savingPassword">
                    {{ savingPassword ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import { useAuthStore } from '../../stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const user = ref({ name: '', email: '', roles: [], created_at: null })
const successMsg = ref('')
const errorMsg = ref('')
const avatarUrl = ref('')
const fileInput = ref(null)

// Profile form
const profileForm = ref({ name: '', email: '' })
const savingProfile = ref(false)
const profileSaved = ref(false)

// Password form
const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' })
const savingPassword = ref(false)
const passwordSaved = ref(false)

const initials = computed(() => {
  const name = user.value.name || ''
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
})

function clearMessages() {
  successMsg.value = ''
  errorMsg.value = ''
  profileSaved.value = false
  passwordSaved.value = false
}

function triggerFileInput() {
  if (fileInput.value) fileInput.value.click()
}

async function uploadAvatar(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const { data } = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (data.success) {
      avatarUrl.value = data.path
      auth.updateAvatarVersion()
      successMsg.value = 'Foto de perfil actualizada'
      setTimeout(() => { successMsg.value = '' }, 3000)
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al subir la imagen'
  }

  // Reset file input for re-selects
  if (fileInput.value) fileInput.value.value = ''
}

async function fetchProfile() {
  loading.value = true
  try {
    const { data } = await api.get('/auth/me')
    user.value = data.data
    profileForm.value = { name: data.data.name, email: data.data.email }
    // Try to load existing avatar
    avatarUrl.value = `/uploads/avatars/${data.data.id}.jpg?v=${Date.now()}`
  } catch (e) {
    errorMsg.value = 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
}

async function handleUpdateProfile() {
  clearMessages()
  savingProfile.value = true
  try {
    const { data } = await api.put('/auth/profile', profileForm.value)
    user.value = { ...user.value, ...data.data }
    // Update auth store too
    auth.user = { ...auth.user, name: data.data.name, email: data.data.email }
    localStorage.setItem('user', JSON.stringify(auth.user))
    profileSaved.value = true
    setTimeout(() => { profileSaved.value = false }, 3000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al actualizar perfil'
  } finally {
    savingProfile.value = false
  }
}

async function handleUpdatePassword() {
  clearMessages()
  savingPassword.value = true
  try {
    await api.put('/auth/password', passwordForm.value)
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
    passwordSaved.value = true
    setTimeout(() => { passwordSaved.value = false }, 3000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al actualizar contraseña'
  } finally {
    savingPassword.value = false
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.mi-perfil-page {
  max-width: 68rem;
  margin: 0 auto;
}

/* ─── Header ─── */
.page-header {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1a202c);
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
}
.breadcrumb-link {
  color: var(--text-muted, #6b7280);
  text-decoration: none;
  transition: color .15s;
}
.breadcrumb-link:hover { color: #4f46e5; }
.breadcrumb-sep { color: var(--text-muted, #9ca3af); }
.breadcrumb-current { color: #4f46e5; font-weight: 600; }

/* ─── Alerts ─── */
.alert {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1rem 1.25rem;
  border-radius: .75rem;
  margin-bottom: 1.5rem;
  font-size: .875rem;
  font-weight: 500;
  border: 1px solid;
}
.alert-icon { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
.alert-success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}
.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}
:root.dark .alert-success { background: rgba(22,101,52,.15); color: #4ade80; border-color: rgba(22,101,52,.3); }
:root.dark .alert-error { background: rgba(153,27,27,.15); color: #f87171; border-color: rgba(153,27,27,.3); }

/* ─── Profile Card ─── */
.profile-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 1.5rem;
  padding: 1.25rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
:root.dark .profile-card {
  background: #1f2937;
  border-color: #374151;
}

.profile-card-inner {
  padding: 1.5rem;
  text-align: center;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-circle {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: var(--indigo-100);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,.1);
}
:root.dark .avatar-circle {
  background: var(--indigo-900);
  border-color: #1f2937;
}

.avatar-initials {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--indigo-700);
}
:root.dark .avatar-initials { color: var(--indigo-100); }

.avatar-circle-outer {
  position: relative;
  display: inline-block;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-edit-btn {
  position: absolute;
  bottom: .25rem;
  right: .25rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  padding: .5rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,.12);
  transition: transform .15s, background .15s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-edit-btn svg { width: 1.125rem; height: 1.125rem; color: #6b7280; }
.avatar-edit-btn:hover { background: #f3f4f6; transform: scale(1.1); }
:root.dark .avatar-edit-btn { background: #1f2937; border-color: #4b5563; }
:root.dark .avatar-edit-btn svg { color: #9ca3af; }
:root.dark .avatar-edit-btn:hover { background: #374151; }

.hidden-file-input {
  display: none;
}

.profile-info { margin-top: .5rem; }

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin-bottom: .35rem;
}
:root.dark .profile-name { color: #f9fafb; }

.profile-email {
  font-size: .9375rem;
  color: var(--text-muted, #6b7280);
  margin-bottom: 1rem;
}
:root.dark .profile-email { color: #9ca3af; }

.role-badges {
  display: flex;
  justify-content: center;
  gap: .75rem;
  flex-wrap: wrap;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: .35rem .85rem;
  border-radius: 9999px;
  font-size: .8125rem;
  font-weight: 500;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid rgba(67,56,202,.15);
}
:root.dark .role-badge {
  background: rgba(67,56,202,.2);
  color: #a5b4fc;
  border-color: rgba(165,180,252,.2);
}

/* ─── Form Cards ─── */
.forms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.form-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}
:root.dark .form-card {
  background: #1f2937;
  border-color: #374151;
}

.form-card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:root.dark .form-card-header { border-color: #374151; }

.form-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary, #111827);
}
:root.dark .form-card-title { color: #f9fafb; }

.form-card-body {
  padding: 1.5rem;
}

.form-description {
  font-size: .875rem;
  color: var(--text-muted, #6b7280);
  margin-bottom: 1.5rem;
}
:root.dark .form-description { color: #9ca3af; }

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 768px) {
  .form-grid-2 { grid-template-columns: 1fr 1fr; }
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group { display: flex; flex-direction: column; }

.form-label {
  font-weight: 500;
  font-size: .875rem;
  color: var(--text-primary, #1a202c);
  margin-bottom: .625rem;
}
:root.dark .form-label { color: #f9fafb; }

.form-input {
  width: 100%;
  padding: .75rem 1.25rem;
  border: 1.5px solid var(--border-color, #d1d5db);
  border-radius: .5rem;
  background: transparent;
  font-size: .875rem;
  font-weight: 500;
  color: var(--text-primary, #1a202c);
  outline: none;
  transition: border-color .15s;
}
.form-input:focus { border-color: #4f46e5; }
:root.dark .form-input {
  border-color: #4b5563;
  background: #374151;
  color: #f9fafb;
}
:root.dark .form-input:focus { border-color: #4f46e5; }

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.saved-indicator {
  font-size: .875rem;
  font-weight: 500;
  color: #059669;
  animation: fadeIn .3s ease-in;
}
:root.dark .saved-indicator { color: #34d399; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .625rem 1.5rem;
  background: #4f46e5;
  color: #fff;
  font-weight: 500;
  font-size: .875rem;
  border-radius: .5rem;
  border: none;
  cursor: pointer;
  transition: background .15s;
}
.btn-primary:hover { background: #4338ca; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

/* Danger */
.danger-card { border-color: #fee2e2; }
:root.dark .danger-card { border-color: rgba(153,27,27,.3); }

.danger-header { border-color: #fee2e2; }
:root.dark .danger-header { border-color: rgba(153,27,27,.3); }

.danger-title { color: #dc2626 !important; }
:root.dark .danger-title { color: #f87171 !important; }

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .625rem 1.5rem;
  background: #dc2626;
  color: #fff;
  font-weight: 500;
  font-size: .875rem;
  border-radius: .5rem;
  border: none;
  cursor: pointer;
  transition: background .15s;
}
.btn-danger:hover { background: #b91c1c; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

/* Spinner */
.loading { display: flex; justify-content: center; padding: 4rem 0; }
.spinner {
  width: 2.5rem; height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
