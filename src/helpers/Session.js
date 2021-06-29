import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User'

const jwtPath = path.join(global.rootDir, 'data/jwt-secret')
!fs.existsSync(jwtPath) && fs.writeFileSync(jwtPath, crypto.randomBytes(256).toString('base64'))
const jwtSecret = fs.readFileSync(jwtPath, 'utf-8')

function Session(fields) {
  this.fields = fields
}

Session.prototype = {
  get user() {
    return this.fields.user
  },

  set user(user) {
    this.fields.user = user
  },

  get message() {
    return this.fields.message || ''
  },

  set message(message) {
    this.fields.message = message
  },

  digestMessage() {
    const message = this.message
    this.message = undefined
    return message
  },

  get referrer() {
    const referrer = this.fields.referrer || '/'
    this.fields.referrer = undefined
    return referrer
  },

  set referrer(referrer) {
    this.fields.referrer = referrer
  },

  async authenticateAndSetUser(username, password) {
    this.user = null
    if (!await User.exists({username})) return false
    const user = await User.selectOne('password', {where: {username}})
    if (!await bcrypt.compare(password, user.password.toString())) return false
    this.user = await User.getOne({username})
    return true
  },

  async unsetUser(message) {
    this.user = null
    this.message = message
    return true
  },

  async toCookie() {
    const cookie = {}
    if (this.fields.user) cookie.jwt = await jwt.sign({id: this.user.id}, jwtSecret, {expiresIn: '24h'})
    if (this.fields.message) cookie.message = this.fields.message
    if (this.fields.referrer) cookie.referrer = this.fields.referrer
    return Object.keys(cookie).length ? JSON.stringify(cookie) : null
  }
}

export default {
  async fromCookie(cookie) {
    try {
      cookie = JSON.parse(cookie)
      cookie = typeof cookie === 'object' && cookie ? cookie : {}
    } catch (e) {
      cookie = {}
    }

    let user
    try {
      user = jwt.verify(cookie.jwt, jwtSecret)
      user = await User.getOne({id: user.id})
    }
    catch (e) {
      user = null
    }

    return new Session({
      user,
      message: cookie.jwt && !user ? 'Session expired' : cookie.message,
      referrer: cookie.referrer
    })
  }
}