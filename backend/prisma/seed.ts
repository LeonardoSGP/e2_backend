import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database (produccion limpia)...\n')

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
  console.log('Base de datos limpiada\n')

  // ── CARRERAS (catalogo base del sistema) ───────────────────────────────────
  const carrerasData = [
    { nombre: 'Ingenieria en Sistemas Computacionales', clave: 'ISC' },
    { nombre: 'Ingenieria Industrial',                  clave: 'II'  },
    { nombre: 'Ingenieria Electronica',                 clave: 'IE'  },
    { nombre: 'Ingenieria Mecanica',                    clave: 'IM'  },
    { nombre: 'Ingenieria Mecatronica',                 clave: 'IMT' },
    { nombre: 'Ingenieria Electrica',                   clave: 'IEL' },
    { nombre: 'Ingenieria Civil',                       clave: 'IC'  },
    { nombre: 'Ingenieria en Gestion Empresarial',      clave: 'IGE' },
    { nombre: 'Contador Publico',                       clave: 'CP'  },
    { nombre: 'Licenciatura en Administracion',         clave: 'LA'  },
  ]
  await prisma.carreras.createMany({ data: carrerasData })
  console.log(`${carrerasData.length} carreras creadas`)

  // ── PERFILES (catalogo base del sistema) ───────────────────────────────────
  const perfilesData = [
    { nombre: 'Programador Backend'  },
    { nombre: 'Programador Frontend' },
    { nombre: 'Disenador UI/UX'      },
    { nombre: 'Tester / QA'          },
    { nombre: 'Lider de Proyecto'    },
    { nombre: 'Analista de Datos'    },
    { nombre: 'DevOps / Infraestructura' },
    { nombre: 'Scrum Master'         },
  ]
  await prisma.perfiles.createMany({ data: perfilesData })
  console.log(`${perfilesData.length} perfiles creados`)

  // ── ADMIN (usuario inicial del sistema) ────────────────────────────────────
  const hashedPass = await bcrypt.hash('admin123', 10)
  await prisma.users.create({
    data: {
      name:       'Administrador',
      email:      'admin@deltos.com',
      password:   hashedPass,
      role:       'ADMIN',
      updated_at: new Date(),
    }
  })
  console.log('1 administrador creado (admin@deltos.com / admin123)')

  // ── RESUMEN ───────────────────────────────────────────────────────────────
  console.log('\nSeed de produccion completado:')
  console.log(`  Carreras:  ${await prisma.carreras.count()}`)
  console.log(`  Perfiles:  ${await prisma.perfiles.count()}`)
  console.log(`  Usuarios:  ${await prisma.users.count()}`)
  console.log('\nSistema listo para usar.')
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
