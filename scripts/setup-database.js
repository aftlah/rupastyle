const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf-8')
  const env = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }

  return env
}

async function main() {
  const root = path.join(__dirname, '..')
  const env = {
    ...loadEnvFile(path.join(root, '.env')),
    ...loadEnvFile(path.join(root, '.env.local')),
  }

  const databaseUrl = env.DATABASE_URL || env.SUPABASE_DB_URL
  if (!databaseUrl) {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

    console.error('DATABASE_URL belum diset di .env.local')
    console.error('')
    console.error('Cara A — Otomatis (butuh password database):')
    console.error('  1. Supabase Dashboard > Project Settings > Database')
    console.error('  2. Connection string > URI (mode: Session pooler)')
    console.error('  3. Tambahkan ke .env.local:')
    if (projectRef) {
      console.error(`     DATABASE_URL=postgresql://postgres.${projectRef}:[PASSWORD]@...`)
    } else {
      console.error('     DATABASE_URL=postgresql://postgres.[ref]:[password]@...')
    }
    console.error('  4. Jalankan lagi: npm run setup:db')
    console.error('')
    console.error('Cara B — Manual (tanpa DATABASE_URL):')
    console.error('  1. npm run setup:sql')
    console.error('  2. Copy supabase/setup-all.sql ke Supabase SQL Editor > Run')
    console.error('  3. npm run seed')
    process.exit(1)
  }

  let pg
  try {
    pg = require('pg')
  } catch {
    console.error('Package "pg" belum terinstall. Jalankan: npm install pg')
    process.exit(1)
  }

  const migrationsDir = path.join(root, 'supabase/migrations')
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
      console.log(`Menjalankan migration: ${file}`)
      await client.query(sql)
    }
    console.log('Semua migration berhasil.')
  } catch (err) {
    console.error('Migration gagal:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }

  console.log('Menjalankan seed data...')
  const seed = spawnSync(process.execPath, [path.join(root, 'seed.js')], {
    cwd: root,
    stdio: 'inherit',
  })

  if (seed.status !== 0) {
    process.exit(seed.status ?? 1)
  }

  console.log('Setup database selesai.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
