import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Utilidades ────────────────────────────────────────────────────────────────
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

async function main() {
  console.log(' Seeding database (versión extendida)...\n')

  // ── Limpiar BD ────────────────────────────────────────────────────────────
  await prisma.evaluaciones.deleteMany()
  await prisma.evaluacion_criterios.deleteMany()
  await prisma.evento_jueces.deleteMany()
  await prisma.certificados.deleteMany()
  await prisma.proyecto_avances.deleteMany()
  await prisma.proyectos.deleteMany()
  await prisma.equipo_interacciones.deleteMany()
  await prisma.equipo_miembros.deleteMany()
  await prisma.equipos.deleteMany()
  await prisma.eventos.deleteMany()
  await prisma.carreras.deleteMany()
  await prisma.perfiles.deleteMany()
  await prisma.user_preferences.deleteMany()
  await prisma.users.deleteMany()
  console.log('️  Base de datos limpiada\n')

  // ── CARRERAS ──────────────────────────────────────────────────────────────
  const carrerasData = [
    { nombre: 'Ingeniería en Sistemas Computacionales', clave: 'ISC' },
    { nombre: 'Ingeniería Industrial',                  clave: 'II'  },
    { nombre: 'Ingeniería Electrónica',                 clave: 'IE'  },
    { nombre: 'Ingeniería Mecánica',                    clave: 'IM'  },
    { nombre: 'Ingeniería Mecatrónica',                 clave: 'IMT' },
    { nombre: 'Ingeniería Eléctrica',                   clave: 'IEL' },
    { nombre: 'Ingeniería Civil',                       clave: 'IC'  },
    { nombre: 'Ingeniería en Gestión Empresarial',      clave: 'IGE' },
    { nombre: 'Contador Público',                       clave: 'CP'  },
    { nombre: 'Licenciatura en Administración',         clave: 'LA'  },
  ]
  await prisma.carreras.createMany({ data: carrerasData })
  console.log(` ${carrerasData.length} carreras creadas`)

  // ── PERFILES ──────────────────────────────────────────────────────────────
  const perfilesData = [
    { nombre: 'Programador Backend'  },
    { nombre: 'Programador Frontend' },
    { nombre: 'Diseñador UI/UX'      },
    { nombre: 'Tester / QA'          },
    { nombre: 'Líder de Proyecto'    },
    { nombre: 'Analista de Datos'    },
    { nombre: 'DevOps / Infraestructura' },
    { nombre: 'Scrum Master'         },
  ]
  await prisma.perfiles.createMany({ data: perfilesData })
  const perfiles = await prisma.perfiles.findMany()
  console.log(` ${perfilesData.length} perfiles creados`)

  // ── EVENTOS (6 en total) ──────────────────────────────────────────────────
  const now = new Date()
  const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86_400_000)

  const eventosData = [
    // Finalizados
    {
      nombre:       'Hackathon Primavera 2024',
      descripcion:  'Competencia de desarrollo de software, edición primavera 2024. Temática: Sustentabilidad.',
      fecha_inicio: d(-120), fecha_fin: d(-115), max_jueces: 6, updated_at: new Date(),
    },
    {
      nombre:       'TechFest Otoño 2024',
      descripcion:  'Festival tecnológico con proyectos de IA, IoT y Web. Edición otoño 2024.',
      fecha_inicio: d(-60),  fecha_fin: d(-55),  max_jueces: 5, updated_at: new Date(),
    },
    // Activos
    {
      nombre:       'Hackathon Innovación 2025',
      descripcion:  'Concurso activo de innovación tecnológica. Presentación de proyectos en vivo.',
      fecha_inicio: d(-2),   fecha_fin: d(3),    max_jueces: 6, updated_at: new Date(),
    },
    {
      nombre:       'DataFest 2025',
      descripcion:  'Maratón de ciencia de datos y machine learning. Equipos de hasta 5 personas.',
      fecha_inicio: d(-1),   fecha_fin: d(4),    max_jueces: 5, updated_at: new Date(),
    },
    // Próximos
    {
      nombre:       'CiberSeguridad Cup 2025',
      descripcion:  'Concurso de seguridad informática y hacking ético. Modalidad Capture The Flag.',
      fecha_inicio: d(10),   fecha_fin: d(14),   max_jueces: 5, updated_at: new Date(),
    },
    {
      nombre:       'Hackathon Verano 2025',
      descripcion:  'Gran hackathon de verano con proyectos de realidad aumentada y blockchain.',
      fecha_inicio: d(30),   fecha_fin: d(35),   max_jueces: 7, updated_at: new Date(),
    },
  ]

  const eventos: { id: bigint }[] = []
  for (const ev of eventosData) {
    const created = await prisma.eventos.create({ data: ev })
    eventos.push(created)
  }
  console.log(` ${eventos.length} eventos creados`)

  // ── CRITERIOS POR EVENTO ──────────────────────────────────────────────────
  const criterioSets = [
    // Set A: Hackathon general
    [
      { nombre: 'Innovación',     ponderacion: 30 },
      { nombre: 'Implementación', ponderacion: 40 },
      { nombre: 'Presentación',   ponderacion: 30 },
    ],
    // Set B: TechFest
    [
      { nombre: 'Originalidad',       ponderacion: 25 },
      { nombre: 'Impacto Social',     ponderacion: 25 },
      { nombre: 'Funcionalidad',      ponderacion: 30 },
      { nombre: 'Documentación',      ponderacion: 20 },
    ],
    // Set C: Innovación
    [
      { nombre: 'Creatividad',        ponderacion: 30 },
      { nombre: 'Viabilidad Técnica', ponderacion: 35 },
      { nombre: 'Demo en Vivo',       ponderacion: 35 },
    ],
    // Set D: DataFest
    [
      { nombre: 'Calidad del Dataset',  ponderacion: 20 },
      { nombre: 'Modelo Predictivo',    ponderacion: 40 },
      { nombre: 'Visualización',        ponderacion: 25 },
      { nombre: 'Presentación',         ponderacion: 15 },
    ],
    // Set E: CiberSeg
    [
      { nombre: 'Flags Capturados',   ponderacion: 60 },
      { nombre: 'Tiempo de Solución', ponderacion: 25 },
      { nombre: 'Write-Up',           ponderacion: 15 },
    ],
    // Set F: Verano
    [
      { nombre: 'Diseño UX',       ponderacion: 25 },
      { nombre: 'Innovación Tech', ponderacion: 35 },
      { nombre: 'Escalabilidad',   ponderacion: 20 },
      { nombre: 'Presentación',    ponderacion: 20 },
    ],
  ]

  for (let i = 0; i < eventos.length; i++) {
    await prisma.evaluacion_criterios.createMany({
      data: criterioSets[i].map(c => ({ evento_id: eventos[i].id, ...c }))
    })
  }
  console.log(' Criterios de evaluación creados para todos los eventos')

  // ── CONTRASEÑA HASHEADA ───────────────────────────────────────────────────
  const hashedPass = await bcrypt.hash('password', 10)

  // ── ADMINS ────────────────────────────────────────────────────────────────
  const adminsData = [
    { name: 'Administrador Principal', email: 'admin@test.com',    password: hashedPass, role: 'ADMIN' as const, updated_at: new Date() },
    { name: 'Carlos Rodríguez',        email: 'carlos@test.com',   password: hashedPass, role: 'ADMIN' as const, updated_at: new Date() },
    { name: 'Diana López',             email: 'diana@test.com',    password: hashedPass, role: 'ADMIN' as const, updated_at: new Date() },
  ]
  await prisma.users.createMany({ data: adminsData })
  console.log(` ${adminsData.length} administradores creados`)

  // ── JUECES (20) ───────────────────────────────────────────────────────────
  const juecesNombres = [
    'Dr. Martínez',   'Dra. González',  'Dr. Hernández',  'Dra. Pérez',
    'Dr. Ramírez',    'Dra. Torres',    'Dr. Flores',     'Dra. Rivera',
    'Dr. Cruz',       'Dra. Morales',   'Dr. Ortiz',      'Dra. Gutiérrez',
    'Dr. Jiménez',    'Dra. Vargas',    'Dr. Castillo',   'Dra. Romero',
    'Dr. Medina',     'Dra. Aguilar',   'Dr. Reyes',      'Dra. Mendoza',
  ]
  const juecesData: { name: string; email: string; password: string; role: 'JUEZ'; telefono: string; updated_at: Date }[] = juecesNombres.map((name, i) => ({
    name,
    email:      `juez${i + 1}@test.com`,
    password:   hashedPass,
    role:       'JUEZ' as const,
    telefono:   `614${String(rnd(1000000, 9999999))}`,
    updated_at: new Date(),
  }))
  await prisma.users.createMany({ data: juecesData })
  const jueces = await prisma.users.findMany({ where: { role: 'JUEZ' } })
  console.log(` ${jueces.length} jueces creados`)

  // ── ASIGNAR JUECES A EVENTOS ──────────────────────────────────────────────
  // Eventos 0-3 (finalizados + activos) → primeros 6 jueces
  // Eventos 4-5 (próximos) → jueces 6-11
  const juecesEventoMap = [
    [0,1,2,3,4,5],   // Hackathon Primavera 2024
    [2,3,4,5,6],     // TechFest Otoño 2024
    [0,1,6,7,8,9],   // Hackathon Innovación 2025
    [3,4,7,8,9],     // DataFest 2025
    [10,11,12,13,14],// CiberSeg Cup
    [13,14,15,16,17,18,19], // Hackathon Verano
  ]
  for (let i = 0; i < eventos.length; i++) {
    for (const ji of juecesEventoMap[i]) {
      await prisma.evento_jueces.create({
        data: { evento_id: eventos[i].id, user_id: jueces[ji].id }
      })
    }
  }
  console.log(' Jueces asignados a eventos')

  // ── PARTICIPANTES (50) ────────────────────────────────────────────────────
  const nombresParticipantes = [
    'Alejandro García','Beatriz Moreno','Carlos Jiménez','Daniela Soto','Eduardo Vargas',
    'Fernanda López','Gabriel Ruiz','Hana Tanaka','Ivan Rodríguez','Julia Mendoza',
    'Kevin Castro','Laura Núñez','Miguel Ángel Torres','Natalia Reyes','Omar Salinas',
    'Patricia Fuentes','Qian Zhang','Roberto Medina','Sofía Hernández','Tomás Aguilar',
    'Ursula Peña','Víctor Guerrero','Wendy Flores','Xochitl Ramírez','Yahir Orozco',
    'Zaira Domínguez','Andrés Vega','Brenda Carrillo','César Molina','Doris Pacheco',
    'Emiliano Ríos','Fabiola Ibarra','Gustavo Lara','Hilda Coronado','Ismael Guzmán',
    'Jacqueline Trejo','Kevin Alamillo','Linda Maldonado','Marco Velázquez','Nadia Ponce',
    'Orlando Espinoza','Priscila Bernal','Rodrigo Cano','Sandra Olea','Tadeo Villanueva',
    'Úrsula Macías','Vladimir Lugo','Wanda Arellano','Ximena Delgado','Yolanda Barajas',
  ]
  const carrerasNombres = carrerasData.map(c => c.nombre)

  const participantesData: {
    name: string; email: string; password: string; carrera: string;
    no_control: string; role: 'PARTICIPANTE'; telefono: string; updated_at: Date
  }[] = nombresParticipantes.map((name, i) => ({
    name,
    email:      `participante${i + 1}@test.com`,
    password:   hashedPass,
    carrera:    pick(carrerasNombres),
    no_control: `2026${String(i + 1).padStart(3, '0')}`,
    role:       'PARTICIPANTE' as const,
    telefono:   `614${String(rnd(1000000, 9999999))}`,
    updated_at: new Date(),
  }))
  await prisma.users.createMany({ data: participantesData })
  const participantes = await prisma.users.findMany({ where: { role: 'PARTICIPANTE' } })
  console.log(` ${participantes.length} participantes creados`)

  // ── USER PREFERENCES (admins y algunos participantes) ────────────────────
  const admins = await prisma.users.findMany({ where: { role: 'ADMIN' } })
  for (const admin of admins) {
    await prisma.user_preferences.create({
      data: {
        user_id:    admin.id,
        settings:   JSON.stringify({ theme: 'dark', language: 'es', notifications: true }),
        updated_at: new Date(),
      }
    })
  }
  console.log(' Preferencias de usuario creadas para admins')

  // ── EQUIPOS + MIEMBROS + PROYECTOS + AVANCES + EVALUACIONES ──────────────
  const rolesEquipo = ['LIDER', 'PROGRAMADOR', 'PROGRAMADOR', 'DISENADOR', 'TESTER']
  const nombresProyectos = [
    'EcoTrack','MediConnect','SmartCampus','HydroSense','AgroBot',
    'SafeRoute','TalentLink','EduVR','GreenChain','CivicMind',
    'NutriScan','TechBridge','AirPulse','CodeMentor','OpenPharma',
    'QuakeSafe','CropAI','CityFlow','HealthHub','DataVault',
    'SecureNet','CloudMesh','RuralNet','EduBot','CarbonMap',
    'FoodTrace','MediAlert','PowerGrid','LearnPath','InnoVate',
  ]

  let equipoIdx   = 0
  let participIdx = 0

  // 5 equipos por evento = 30 equipos en total (50 participantes / 5 = 10... reusamos ciclicamente)
  const equiposPorEvento = 5

  for (let e = 0; e < eventos.length; e++) {
    const criterios = await prisma.evaluacion_criterios.findMany({ where: { evento_id: eventos[e].id } })
    const juecesEvento = await prisma.evento_jueces.findMany({ where: { evento_id: eventos[e].id } })
    const esEvaluado = e <= 3  // finalizados y activos

    for (let t = 0; t < equiposPorEvento; t++) {
      const proyNombre = nombresProyectos[equipoIdx % nombresProyectos.length]

      // Crear equipo
      const equipo = await prisma.equipos.create({
        data: {
          nombre:           `${proyNombre} Team (${eventosData[e].nombre.split(' ')[0]})`,
          max_programadores: 2,
          max_disenadores:   1,
          max_testers:       1,
          updated_at:        new Date(),
        }
      })

      // Asignar 5 miembros (cíclico sobre participantes)
      for (let m = 0; m < 5; m++) {
        const p = participantes[(participIdx + m) % participantes.length]
        await prisma.equipo_miembros.create({
          data: {
            equipo_id:  equipo.id,
            user_id:    p.id,
            rol:        rolesEquipo[m],
            created_at: new Date(),
          }
        })
      }

      // Crear proyecto
      const proyecto = await prisma.proyectos.create({
        data: {
          equipo_id:       equipo.id,
          evento_id:       eventos[e].id,
          nombre:          proyNombre,
          descripcion:     `Solución tecnológica desarrollada por el equipo "${equipo.nombre}" para el concurso "${eventosData[e].nombre}". Busca resolver problemas reales mediante innovación.`,
          repositorio_url: `https://github.com/demo/${proyNombre.toLowerCase().replace(/\s/g, '-')}`,
          updated_at:      new Date(),
        }
      })

      // Avances del proyecto (2-4 avances)
      const numAvances = rnd(2, 4)
      for (let a = 0; a < numAvances; a++) {
        await prisma.proyecto_avances.create({
          data: {
            proyecto_id: proyecto.id,
            descripcion: [
              'Se completó el diseño de la arquitectura del sistema y mockups iniciales de la interfaz.',
              'Integración del backend con la base de datos y primeras pruebas de API REST.',
              'Se implementó autenticación JWT y panel de administración.',
              'Despliegue en servidor de staging y pruebas de carga completadas.',
              'Corrección de bugs reportados en QA. Versión 1.0 lista para presentación.',
            ][a] || `Avance ${a + 1}: Progreso continuo del proyecto según el plan establecido.`,
            fecha: d(-rnd(1, 30)),
          }
        })
      }

      // Evaluaciones (solo para eventos finalizados y activos)
      if (esEvaluado && criterios.length > 0 && juecesEvento.length > 0) {
        const comentarios = [
          'Excelente presentación y solución muy creativa.',
          'Buen manejo técnico aunque la presentación puede mejorar.',
          'Gran impacto social del proyecto, bien ejecutado.',
          'Implementación sólida con potencial de escalabilidad.',
          'Proyecto ambicioso con resultados prometedores.',
          'Muy buena integración tecnológica y trabajo en equipo visible.',
        ]
        for (const juez of juecesEvento) {
          for (const criterio of criterios) {
            await prisma.evaluaciones.create({
              data: {
                proyecto_id: proyecto.id,
                juez_id:     juez.user_id,
                criterio_id: criterio.id,
                puntuacion:  rnd(65, 100),
                comentario:  pick(comentarios),
                created_at:  new Date(),
              }
            })
          }
        }
      }

      // Certificados (solo eventos finalizados)
      if (e < 2) {
        for (let m = 0; m < 5; m++) {
          const p = participantes[(participIdx + m) % participantes.length]
          await prisma.certificados.create({
            data: {
              user_id:      p.id,
              evento_id:    eventos[e].id,
              tipo:         m === 0 ? 'GANADOR' : 'PARTICIPACION',
              archivo_path: `/certificados/${eventos[e].id}/${p.id}.pdf`,
              codigo_qr:    `QR-${eventos[e].id}-${p.id}-${Date.now()}`,
              created_at:   new Date(),
            }
          })
        }
      }

      // Interacciones de equipo (SOLICITUD e INVITACION) para equipos activos
      if (e >= 2 && participantes.length > 0) {
        const solicitante = participantes[rnd(0, participantes.length - 1)]
        await prisma.equipo_interacciones.create({
          data: {
            equipo_id: equipo.id,
            user_id:   solicitante.id,
            tipo:      'SOLICITUD',
            estado:    pick(['PENDIENTE', 'ACEPTADA', 'RECHAZADA'] as const),
            mensaje:   `Hola, me gustaría unirme al equipo "${equipo.nombre}". Tengo experiencia en desarrollo web.`,
            perfil_id: pick(perfiles).id,
            created_at: new Date(),
          }
        })
      }

      participIdx += 5
      equipoIdx++
    }

    console.log(` ${equiposPorEvento} equipos/proyectos creados para: ${eventosData[e].nombre}`)
  }

  // ── RESUMEN ───────────────────────────────────────────────────────────────
  const totales = {
    carreras:      await prisma.carreras.count(),
    perfiles:      await prisma.perfiles.count(),
    eventos:       await prisma.eventos.count(),
    users:         await prisma.users.count(),
    equipos:       await prisma.equipos.count(),
    proyectos:     await prisma.proyectos.count(),
    avances:       await prisma.proyecto_avances.count(),
    evaluaciones:  await prisma.evaluaciones.count(),
    certificados:  await prisma.certificados.count(),
    interacciones: await prisma.equipo_interacciones.count(),
  }

  console.log('\n RESUMEN FINAL:')
  console.log(`   Carreras:       ${totales.carreras}`)
  console.log(`   Perfiles:       ${totales.perfiles}`)
  console.log(`   Eventos:        ${totales.eventos}`)
  console.log(`   Usuarios:       ${totales.users}`)
  console.log(`   Equipos:        ${totales.equipos}`)
  console.log(`   Proyectos:      ${totales.proyectos}`)
  console.log(`   Avances:        ${totales.avances}`)
  console.log(`   Evaluaciones:   ${totales.evaluaciones}`)
  console.log(`   Certificados:   ${totales.certificados}`)
  console.log(`   Interacciones:  ${totales.interacciones}`)
  console.log('\n Seed extendido completado exitosamente!')
}

main()
  .catch(e => { console.error(' Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
