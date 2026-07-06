const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const migrationsDir = path.join(root, 'supabase/migrations')
const outFile = path.join(root, 'supabase/setup-all.sql')

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

const combined = files
  .map((file) => {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8').trim()
    return `-- ===== ${file} =====\n${sql}`
  })
  .join('\n\n')

fs.writeFileSync(outFile, combined + '\n')

console.log('File SQL gabungan dibuat: supabase/setup-all.sql')
console.log('')
console.log('Langkah manual (tanpa DATABASE_URL):')
console.log('1. Buka Supabase Dashboard > SQL Editor')
console.log('2. Copy isi file supabase/setup-all.sql')
console.log('3. Run query')
console.log('4. Jalankan: npm run seed')
