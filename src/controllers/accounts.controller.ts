import { Request, Response } from 'express'
import fs from 'fs-extra'
import { In } from 'typeorm'
import xlsx from 'xlsx'
import AppDataSource from '../db'
import { Accounts } from '../entities/accounts.entity'
import { getErrorMessage } from '../helpers/error.helper'

const accountsRepository = AppDataSource.getRepository(Accounts)

export const getAll = async (_: Request, res: Response): Promise<Response<Accounts[]>> => {
  const accounts = await accountsRepository.find()
  return res.json(accounts)
}

// export const getAllByDni = async (req: Request, res: Response): Promise<Response<Accounts[]>> => {
//   const { dni } = req.params
//   const certificates = await accountsRepository.find({ where: { dni } })
//   return res.json(certificates)
// }

// export const getById = async (req: Request, res: Response): Promise<Response<Accounts[]>> => {
//   const { id } = req.params
//   const certificate = await accountsRepository.findOne({ where: { id } })

//   if (certificate === null) return res.status(404).json({ message: 'No se encontró el certificado' })
//   return res.json(certificate)
// }

// export const getByCod = async (req: Request, res: Response): Promise<Response<Accounts>> => {
//   const { cod } = req.params
//   const certificate = await accountsRepository.findOne({ where: { certification: cod } })

//   if (certificate === null) return res.status(404).json({ message: 'No se encontró el certificado' })
//   return res.json(certificate)
// }

export const create = async (req: Request, res: Response): Promise<Response<Accounts>> => {
  const body = accountsRepository.create({ ...req.body })

  try {
    const newAccounts = await accountsRepository.save(body)

    return res.json(newAccounts)
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const update = async (req: Request, res: Response): Promise<Response<Accounts>> => {
  const { id } = req.params

  const accounts = await accountsRepository.findOne({ where: { id } })

  if (accounts === null) {
    return res.status(404).json({ message: 'No se encontró el cuenta' })
  }

  const accountsUpdated = {
    ...accounts,
    ...req.body
  }

  try {
    return res.json(await accountsRepository.save(accountsUpdated))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const remove = async (req: Request, res: Response): Promise<Response<Accounts>> => {
  const { id } = req.params

  const account = await accountsRepository.findOne({ where: { id } })

  if (account === null) {
    return res.status(404).json({ message: 'No se encontró el cuenta' })
  }

  try {
    return res.json(await accountsRepository.remove(account))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const removeMultiple = async (req: Request, res: Response): Promise<Response<Accounts[]>> => {
  const { ids } = req.body
  const accounts = await accountsRepository.find({ where: { id: In(ids) } })

  if (ids.length !== accounts.length) {
    return res.status(400).json({ message: 'Hubo un error, un certificado no se encontró, intenta más tarde' })
  }

  try {
    return res.json(await accountsRepository.remove(accounts))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

const SHEET_NAMES = ['CODIGO', 'CUENTA']

export const importExcel = async (req: Request, res: Response): Promise<Response<Object>> => {
  if (req.file?.filename === null || req.file?.filename === undefined) {
    return res.status(400).json({ message: 'Archivo no proporcionado' })
  }

  const filename = `files/${req.file?.filename}`

  try {
    const workbook = xlsx.readFile(filename, { type: 'binary', cellDates: true })
    const sheet = workbook.SheetNames.find((name) => name.toUpperCase() === 'CUENTAS')

    if (sheet === undefined) {
      await fs.remove(filename)
      return res.status(400).json({ message: 'El formato del archivo debe coincidir con el formato establecido' })
    }

    const data: Object[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet])

    const dataHeaders = Object.keys(data[0]).map(key => key.toUpperCase())

    if (!SHEET_NAMES.every(name => dataHeaders.includes(name))) {
      await fs.remove(filename)
      return res.status(400).json({ message: 'El formato del archivo debe coincidir con el formato establecido' })
    }

    const accountsInExcel = data.map((data: any) => {
      const obj: any = {}
      Object.keys(data).forEach(key => {
        obj[key.toUpperCase()] = data[key]
      })
      return {
        code: obj.CODIGO,
        accounts: obj.CUENTA,
      }
    })

    await fs.remove(filename)
    return res.status(200).json(await accountsRepository.save(accountsInExcel))
  } catch (error) {
    await fs.remove(filename)
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}
