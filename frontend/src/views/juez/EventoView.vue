<template>
  <AppLayout>
    <div style="background:#ffffff; min-height:100vh; padding:1.5rem 3rem">
      
      <!-- Banner Evento Concluido -->
      <div v-if="isFinished" style="max-width:1200px; margin-bottom:1.5rem; background:#fff7ed; border:1px solid #ffedd5; border-radius:1rem; padding:1rem 1.5rem; display:flex; align-items:center; gap:1rem">
        <div style="background:#ea580c; color:#fff; width:2.5rem; height:2.5rem; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; flex-shrink:0">
          <svg style="width:1.25rem; height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h4 style="margin:0; font-size:0.9rem; font-weight:800; color:#9a3412">Este evento ha concluido</h4>
          <p style="margin:2px 0 0; font-size:0.75rem; color:#c2410c; font-weight:600">Las evaluaciones ahora están en modo de solo lectura.</p>
        </div>
      </div>

      <!-- Header Interno -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2.5rem; max-width:1200px">
        <div>
          <h2 style="font-size:1.5rem; font-weight:900; color:#111827; margin:0; letter-spacing:-0.03em">
            {{ evento?.nombre || 'Hackathon DELTOS 2026' }}
          </h2>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:4px">
            <p style="font-size:0.75rem; color:#9ca3af; margin:0; font-weight:600; text-transform:uppercase; letter-spacing:0.05em">Panel de Gestión y Evaluación</p>
            <template v-if="isFinished">
              <span style="color:#e2e8f0">•</span>
              <span style="background:#f1f5f9; color:#64748b; font-size:0.65rem; font-weight:900; padding:0.2rem 0.6rem; border-radius:6px; text-transform:uppercase">FINALIZADO</span>
            </template>
          </div>
        </div>
        <router-link to="/juez/dashboard" class="btn btn-outline" style="padding:0.6rem 1.2rem; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:800; border-radius:0.75rem; background:#fff">
          <svg style="width:0.875rem; height:0.875rem; margin-right:0.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver al Panel
        </router-link>
      </div>

      <!-- Navegación de Pestañas -->
      <div style="border-bottom:1px solid #f3f4f6; margin-bottom:2rem; max-width:1200px">
        <nav style="display:flex; gap:2.5rem">
          <button @click="activeTab = 'proyectos'" 
                  :style="activeTab === 'proyectos' ? 'border-bottom:3px solid #4f46e5; color:#4f46e5' : 'border-bottom:3px solid transparent; color:#9ca3af'"
                  style="padding:1rem 0.25rem; font-weight:700; font-size:0.85rem; background:none; border-top:none; border-left:none; border-right:none; cursor:pointer; display:flex; align-items:center; gap:0.6rem; transition:all 0.3s ease">
            <svg style="width:1.1rem; height:1.1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Proyectos a Evaluar
          </button>
          <button @click="activeTab = 'rubrica'" 
                  :style="activeTab === 'rubrica' ? 'border-bottom:3px solid #4f46e5; color:#4f46e5' : 'border-bottom:3px solid transparent; color:#9ca3af'"
                  style="padding:1rem 0.25rem; font-weight:700; font-size:0.85rem; background:none; border-top:none; border-left:none; border-right:none; cursor:pointer; display:flex; align-items:center; gap:0.6rem; transition:all 0.3s ease">
            <svg style="width:1.1rem; height:1.1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Criterios de Evaluación
          </button>
        </nav>
      </div>

      <div v-if="loading" style="display:flex; justify-content:center; padding:6rem; max-width:1200px">
        <div class="spinner"></div>
      </div>

      <div v-else style="max-width:1200px">
        <!-- TAB 1: LISTADO -->
        <div v-if="activeTab === 'proyectos'" style="background:#ffffff; border:1px solid #f3f4f6; border-radius:1.5rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.03)">
          <div style="padding:1.75rem 2rem; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center">
            <h3 style="font-size:1.25rem; font-weight:900; color:#111827">Listado de Proyectos</h3>
            <span style="background:#f3f4f6; color:#6b7280; font-size:0.75rem; font-weight:800; padding:0.4rem 1rem; border-radius:99px">{{ sortedProyectos.length }} Proyectos</span>
          </div>
          
          <div v-if="!sortedProyectos.length" class="empty-state">
            <p>No se encontraron proyectos para este evento.</p>
          </div>

          <div v-else style="overflow-x:auto">
            <table style="width:100%; border-collapse:collapse">
              <thead>
                <tr style="background:#fafafa">
                  <th style="padding:1.25rem 2rem; text-align:left; font-size:0.7rem; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em">Ranking</th>
                  <th style="padding:1.25rem 1rem; text-align:left; font-size:0.7rem; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em">Equipo</th>
                  <th style="padding:1.25rem 1rem; text-align:left; font-size:0.7rem; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em">Proyecto</th>
                  <th style="padding:1.25rem 1rem; text-align:center; font-size:0.7rem; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em">Estado</th>
                  <th style="padding:1.25rem 2rem; text-align:right; font-size:0.7rem; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, index) in sortedProyectos" :key="p.id" class="table-row">
                  <td style="padding:1.5rem 2rem; width:100px">
                    <div style="display:flex; align-items:center; justify-content:center; width:3rem; height:3rem; font-size:1.75rem">
                      <template v-if="index === 0"></template>
                      <template v-else-if="index === 1"></template>
                      <template v-else-if="index === 2"></template>
                      <template v-else><span style="font-weight:900; color:#e2e8f0; font-size:1rem">#{{ index + 1 }}</span></template>
                    </div>
                  </td>
                  <td style="padding:1.5rem 1rem">
                    <div style="font-weight:800; color:#111827; font-size:1rem">{{ p.equipo?.nombre }}</div>
                    <div style="font-size:0.8rem; color:#9ca3af; margin-top:4px">{{ p.equipo?.miembros_count }} Participantes</div>
                  </td>
                  <td style="padding:1.5rem 1rem">
                    <div style="font-weight:800; color:#4f46e5; font-size:0.95rem">{{ p.nombre }}</div>
                    <p style="font-size:0.8rem; color:#64748b; margin-top:4px; max-width:350px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">
                      {{ p.descripcion }}
                    </p>
                  </td>
                  <td style="padding:1.5rem 1rem; text-align:center">
                    <div v-if="p.yaCalificado" style="display:inline-flex; align-items:center; gap:0.5rem; background:#ecfdf5; color:#059669; padding:0.4rem 1rem; border-radius:99px; font-size:0.7rem; font-weight:800; text-transform:uppercase">
                       <svg style="width:0.875rem; height:0.875rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                       Evaluado
                    </div>
                    <div v-else style="display:inline-flex; align-items:center; gap:0.5rem; background:#fff7ed; color:#ea580c; padding:0.4rem 1rem; border-radius:99px; font-size:0.7rem; font-weight:800; text-transform:uppercase">
                       <svg style="width:0.875rem; height:0.875rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       Pendiente
                    </div>
                  </td>
                  <td style="padding:1.5rem 2rem; text-align:right">
                    <router-link :to="'/juez/evaluar/' + p.id" 
                                :class="isFinished ? 'btn-outline' : 'btn-indigo'"
                                class="btn" style="padding:0.5rem 1.25rem; font-weight:800; border-radius:0.75rem; font-size:0.75rem; min-width:110px; text-align:center">
                      {{ isFinished ? 'Ver Evaluación' : (p.yaCalificado ? 'Editar Nota' : 'Puntuar') }}
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: RÚBRICA (Solo Lectura) -->
        <div v-if="activeTab === 'rubrica'" style="max-width:800px; margin:0 auto">
          <div style="background:#ffffff; border:1px solid #f3f4f6; border-radius:1.5rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.03); overflow:hidden">
            <div style="padding:2rem; border-bottom:1px solid #f3f4f6; background:linear-gradient(to right, #f8fafc, #ffffff); display:flex; justify-content:space-between; align-items:center">
              <div>
                <h3 style="font-size:1.25rem; font-weight:900; color:#111827">Criterios de Evaluación</h3>
                <p style="font-size:0.8rem; color:#64748b; margin-top:4px">Rúbrica oficial definida por la administración del evento.</p>
              </div>
              <div style="background:#ecfdf5; color:#059669; font-size:0.7rem; font-weight:900; padding:0.5rem 1rem; border-radius:99px; border:1px solid #d1fae5; display:flex; align-items:center; gap:0.5rem">
                <svg style="width:1rem; height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Rúbrica Validada
              </div>
            </div>
            
            <div v-if="!criteria.length" style="padding:4rem 2rem; text-align:center">
              <div style="font-size:3rem; margin-bottom:1rem"></div>
              <p style="color:#64748b; font-weight:600">El administrador aún no ha definido los criterios para este evento.</p>
            </div>

            <div v-else style="padding:0.5rem 0">
              <div v-for="c in criteria" :key="c.id" style="padding:1.25rem 2rem; border-bottom:1px solid #f3f4f6; display:flex; align-items:center; justify-content:space-between; transition:all 0.3s ease" class="criteria-row">
                <div style="display:flex; align-items:center; gap:2rem; flex:1">
                   <div style="width:3.5rem; height:3.5rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:1rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 4px -1px rgba(0,0,0,0.05)">
                      <span style="font-weight:900; font-size:1.1rem; color:#4f46e5">{{ c.ponderacion }}%</span>
                   </div>
                   <div style="flex:1">
                      <div style="font-weight:900; font-size:1rem; color:#111827; letter-spacing:-0.01em">{{ c.nombre }}</div>
                      <div style="width:100%; max-width:350px; height:6px; background:#f1f5f9; border-radius:99px; margin-top:0.6rem; overflow:hidden">
                         <div style="height:100%; background:linear-gradient(to right, #4f46e5, #818cf8); border-radius:99px" :style="{ width: c.ponderacion + '%' }"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div style="background:#f8fafc; padding:1rem 2rem; border-top:1px solid #f3f4f6">
               <div style="display:flex; justify-content:space-between; align-items:center">
                  <span style="font-size:0.8rem; font-weight:700; color:#64748b">Peso Total Acumulado</span>
                  <span style="font-size:1.1rem; font-weight:900; color:#111827">{{ sumPonderacion }}%</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const route = useRoute()
const activeTab = ref('proyectos')
const loading = ref(true)
const evento = ref(null)
const projects = ref([])
const criteria = ref([])

const isFinished = computed(() => {
  if (!evento.value?.fecha_fin) return false
  return new Date() > new Date(evento.value.fecha_fin)
})

const sortedProyectos = computed(() => {
  return [...projects.value].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
})

async function fetchData() {
  try {
    const r = await api.get(`/juez/eventos/${route.params.id}`)
    const data = r.data.data
    evento.value = data
    projects.value = data.proyectos || []
    criteria.value = data.evaluacion_criterios || []
  } catch (e) {
    console.error('Error fetching event details:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.table-row {
  border-bottom: 1px solid #f8fafc;
  transition: all 0.2s ease;
}
.table-row:hover {
  background-color: #fcfcfc;
}
.criteria-row:hover {
  background-color: #f8fafc;
}
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn:hover {
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(1px) scale(0.98);
}
</style>
