import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import AppDataSource from '../db'
import { User } from '../entities/user.entity'
import { getErrorMessage } from '../helpers/error.helper'
import * as argon2 from 'argon2'

const usersRepository = AppDataSource.getRepository(User)

export const login = async (req: Request, res: Response): Promise<Response<User>> => {
  const { username, password } = req.body
  const user = await usersRepository.findOne({ where: { username } })

  if (user === null) {
    return res.status(404).json({ message: 'User not found' })
  }

  const isValidPassword = await user.comparePassword(password)

  if (!isValidPassword) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }

  try {
    const token = jwt.sign({
      id: user.id,
      name: user.username
    }, 'secret', {
      expiresIn: 60 * 60 * 24 * 10
    })

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const currentUser = async (req: Request, res: Response): Promise<Response<User>> => {
  const { id } = req.user
  const user = await usersRepository.findOne({ where: { id } })

  if (user === null) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.status(200).json({
    id: user.id,
    username: user.username
  })
}

export const update = async (req: Request, res: Response): Promise<Response<User>> => {
  const { id } = req.params

  const user = await usersRepository.findOne({ where: { id } })

  if (user === null) {
    return res.status(404).json({ message: 'No se encontró el usuario' })
  }

  if (Object.keys(req.body).includes('password')) {
    req.body.password = await argon2.hash(req.body.password)
  }

  const userUpdated = {
    ...user,
    ...req.body
  }

  try {
    return res.json(await usersRepository.save(userUpdated))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const register = async (req: Request, res: Response): Promise<Response<User>> => {
  const { username, password, role } = req.body
  const existingUser = await usersRepository.findOne({ where: { username } })

  if (existingUser !== null) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const user = usersRepository.create({ username, password, role })

  try {
    const newUser = await usersRepository.save(user)
    return res.status(200).json({
      id: newUser.id,
      username: newUser.username
    })
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}
