import { promises as fs } from "node:fs"
import path from "node:path"

const storageDir = path.join(process.cwd(), "storage")

async function ensureStorageDir() {
  await fs.mkdir(storageDir, { recursive: true })
}

export async function appendRecord<T extends object>(fileName: string, nextRecord: T) {
  await ensureStorageDir()
  const filePath = path.join(storageDir, fileName)

  const current = await readRecords<T>(fileName)
  current.push(nextRecord)

  await fs.writeFile(filePath, JSON.stringify(current, null, 2), "utf-8")
}

export async function readRecords<T>(fileName: string): Promise<T[]> {
  await ensureStorageDir()
  const filePath = path.join(storageDir, fileName)

  try {
    const content = await fs.readFile(filePath, "utf-8")
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
