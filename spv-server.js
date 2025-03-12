import express from 'express'
import sqlite3 from 'sqlite3'
import { z } from 'zod'
import dotenv from 'dotenv'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import ejs from 'ejs'
import fs from 'fs'
import { sendEmail } from './email.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config()
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL_PROD : process.env.BASE_URL

const emailParser = z.string().email()
const fingerprintParser = z.string().regex(/^[a-f0-9]{32}$/)
const hashParser = z.string().regex(/^[a-f0-9]{8}$/)
const secret = process.env.JWT_SECRET

const app = express()

app.use(express.json())
app.use(express.static(join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

// 404 handler
app.get('/:path', (req, res) => {
  res.status(404).sendFile(join(__dirname, '404.html'))
})

app.post('/api/register', async (req, res) => {
  // check if the email is valid
  let email = ''
  try {
    email = emailParser.parse(req.body.email)
  } catch (error) {
    res.status(400).json({ message: 'email not valid' })
    return
  }

  // check if the fingerprint is valid
  let fingerprint = ''
  try {
    fingerprint = fingerprintParser.parse(req.body.fingerprint)
  } catch (error) {
    res.status(400).json({ message: 'fingerprint not valid' })
    return
  }

  // check if the user already exists
  const db = new sqlite3.Database(process.env.DB_PATH)
  const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
  if (user) {
    if (user.fingerprint === fingerprint) {
      res.json({ message: 'user exists' })
      return
    } else {
      res.status(400).json({ message: `are you ${user.email.split('@')[0]}?` })
      return
    }
  }

  // user not exists, generate a token and hash
  const token = jwt.sign({ fingerprint, email }, secret, { noTimestamp: true })
  const hash = crypto.createHash('sha256').update(token).digest('hex').slice(0, 8)

  // insert the user into the database
  db.run(
    'INSERT INTO users (hash, fingerprint, token, email) VALUES (?, ?, ?, ?)',
    [hash, fingerprint, token, email],
    err => {
      if (err) {
        console.error(err)
      } else {
        res.json({ message: 'please check your email' })
        sendEmail({ to: email, subject: 'Receive your link', link: `${BASE_URL}?hash=${hash}` })
      }
    }
  )
  db.close()
})

app.post('/api/verify', async (req, res) => {
  // check if the hash is valid
  let hash = ''
  try {
    hash = hashParser.parse(req.body.hash)
  } catch (error) {
    res.status(400).json({ message: 'hash invalid' })
    return
  }

  // check if the fingerprint is valid
  let fingerprint = ''
  try {
    fingerprint = fingerprintParser.parse(req.body.fingerprint)
  } catch (error) {
    res.status(400).json({ message: 'fingerprint not valid' })
    return
  }

  // check if the user exists
  const db = new sqlite3.Database(process.env.DB_PATH)
  const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE hash = ?', [hash], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
  if (user) {
    const decodedToken = jwt.verify(user.token, process.env.JWT_SECRET)
    if (decodedToken.fingerprint === fingerprint) {
      const template = ejs.compile(fs.readFileSync(join(__dirname, 'product-template.ejs'), 'utf8'))
      res.json({ message: template({ name: user.email.split('@')[0] }) })
    } else {
      res.status(400).json({ message: `are you ${user.email.split('@')[0]}?` })
    }
  } else {
    res.status(400).json({ message: 'hash invalid' })
  }
  db.close()
})

app.listen(process.env.PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`)
})
