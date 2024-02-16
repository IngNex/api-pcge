import { Request, Response } from 'express'
import fs from 'fs-extra'
import { In } from 'typeorm'
import xlsx from 'xlsx'
import AppDataSource from '../db'
import { Person } from '../entities/person.entity'
import { getErrorMessage } from '../helpers/error.helper'

const peopleRepository = AppDataSource.getRepository(Person)

export const getAll = async (_: Request, res: Response): Promise<Response<Person[]>> => {
  const people = await peopleRepository.find()
  return res.json(people)
}

export const getByDni = async (req: Request, res: Response): Promise<Response<Person[]>> => {
  const { dni } = req.params
  const person = await peopleRepository.find({ where: { docNum: dni } })
  //const person = await peopleRepository.findOne({ where: { docNum: dni } })

  if (person === null) return res.status(404).json({ message: 'Person not found' })
  return res.json(person)
}

export const getById = async (req: Request, res: Response): Promise<Response<Person[]>> => {
  const { id } = req.params
  const person = await peopleRepository.findOne({ where: { id } })

  if (person === null) return res.status(404).json({ message: 'Person not found' })
  return res.json(person)
}

export const create = async (req: Request, res: Response): Promise<Response<Person>> => {
  console.log(req.body)
  const body = peopleRepository.create({ ...req.body })

  try {
    const newPerson = await peopleRepository.save(body)

    return res.json(newPerson)
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const update = async (req: Request, res: Response): Promise<Response<Person>> => {
  const { id } = req.params

  const person = await peopleRepository.findOne({ where: { id } })

  if (person === null) {
    return res.status(404).json({ message: 'Person not found' })
  }

  const personUpdated = {
    ...person,
    ...req.body
  }

  try {
    return res.json(await peopleRepository.save(personUpdated))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const remove = async (req: Request, res: Response): Promise<Response<Person>> => {
  const { id } = req.params

  const person = await peopleRepository.findOne({ where: { id } })

  if (person === null) {
    return res.status(404).json({ message: 'Person not found' })
  }

  try {
    return res.json(await peopleRepository.remove(person))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const removeMultiple = async (req: Request, res: Response): Promise<Response<Person[]>> => {
  const { ids } = req.body
  const people = await peopleRepository.find({ where: { id: In(ids) } })

  if (ids.length !== people.length) {
    return res.status(400).json({ message: 'Hubo un error, un usuario no se encontró, intenta más tarde' })
  }

  try {
    return res.json(await peopleRepository.remove(people))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

const SHEET_NAMES = ['PERFIL A ACREDITAR', 'FECHA DE INDUCCION', 'DOCUMENTO DE IDENTIDAD', 'NUMERO DE DOCUMENTO DE IDENTIDAD', 'NOMBRES', 'APELLIDOS', 'EMPRESA', 'COD. CREDENCIAL', 'VIGENCIA CREDENCIAL', 'FOTOGRAFIA']

export const importExcel = async (req: Request, res: Response): Promise<Response<Object>> => {
  if (req.file?.filename === null || req.file?.filename === undefined) {
    return res.status(400).json({ message: 'Archivo no proporcionado' })
  }

  const filename = `files/${req.file?.filename}`

  try {
    const workbook = xlsx.readFile(filename, { type: 'binary', cellDates: true })
    const sheet = workbook.SheetNames.find((name) => name === 'FOTOCHECKS')

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

    const peopleInDatabase = await peopleRepository.find()

    const peopleExcel = data.map((data: any) => {
      const obj: any = {}
      Object.keys(data).forEach(key => {
        obj[key.toUpperCase()] = data[key]
      })
      const aux: string = obj.FOTOGRAFIA
      const imageId = aux.split('?id=')[1]
      const profileImage = `https://drive.google.com/uc?export=view&id=${imageId}`
      return {
        profile: obj['PERFIL A ACREDITAR'],
        inductionDate: obj['FECHA DE INDUCCION'],
        docType: obj['DOCUMENTO DE IDENTIDAD'],
        docNum: String(obj['NUMERO DE DOCUMENTO DE IDENTIDAD']),
        name: obj.NOMBRES,
        lastName: obj.APELLIDOS,
        company: obj.EMPRESA,
        credential: obj['COD. CREDENCIAL'],
        credentialLife: obj['VIGENCIA CREDENCIAL'],
        profileImage
      }
    })

    const people = peopleExcel.filter((personExcel, index) => {
      return peopleExcel.findIndex(person => person.credential === personExcel.credential) === index
    })
      .filter(personToSave => {
        return peopleInDatabase.find(person => person.credential === personToSave.credential) === undefined
      })

    await fs.remove(filename)
    return res.status(200).json(await peopleRepository.save(people))
  } catch (error) {
    await fs.remove(filename)
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}
