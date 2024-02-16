import { Request, Response } from 'express'
import fs from 'fs-extra'
import { In } from 'typeorm'
import xlsx from 'xlsx'
import AppDataSource from '../db'
import { Certificate } from '../entities/certificate.entity'
import { getErrorMessage } from '../helpers/error.helper'

const certificatesRepository = AppDataSource.getRepository(Certificate)

export const getAll = async (_: Request, res: Response): Promise<Response<Certificate[]>> => {
  const certificates = await certificatesRepository.find()
  return res.json(certificates)
}

export const getAllByDni = async (req: Request, res: Response): Promise<Response<Certificate[]>> => {
  const { dni } = req.params
  const certificates = await certificatesRepository.find({ where: { dni } })
  return res.json(certificates)
}

export const getById = async (req: Request, res: Response): Promise<Response<Certificate[]>> => {
  const { id } = req.params
  const certificate = await certificatesRepository.findOne({ where: { id } })

  if (certificate === null) return res.status(404).json({ message: 'No se encontró el certificado' })
  return res.json(certificate)
}

export const getByCod = async (req: Request, res: Response): Promise<Response<Certificate>> => {
  const { cod } = req.params
  const certificate = await certificatesRepository.findOne({ where: { certification: cod } })

  if (certificate === null) return res.status(404).json({ message: 'No se encontró el certificado' })
  return res.json(certificate)
}

export const create = async (req: Request, res: Response): Promise<Response<Certificate>> => {
  const body = certificatesRepository.create({ ...req.body })

  try {
    const newCertificate = await certificatesRepository.save(body)

    return res.json(newCertificate)
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const update = async (req: Request, res: Response): Promise<Response<Certificate>> => {
  const { id } = req.params

  const certificate = await certificatesRepository.findOne({ where: { id } })

  if (certificate === null) {
    return res.status(404).json({ message: 'No se encontró el certificado' })
  }

  const certificateUpdated = {
    ...certificate,
    ...req.body
  }

  try {
    return res.json(await certificatesRepository.save(certificateUpdated))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const remove = async (req: Request, res: Response): Promise<Response<Certificate>> => {
  const { id } = req.params

  const certificate = await certificatesRepository.findOne({ where: { id } })

  if (certificate === null) {
    return res.status(404).json({ message: 'No se encontró el certificado' })
  }

  try {
    return res.json(await certificatesRepository.remove(certificate))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

export const removeMultiple = async (req: Request, res: Response): Promise<Response<Certificate[]>> => {
  const { ids } = req.body
  const certificates = await certificatesRepository.find({ where: { id: In(ids) } })

  if (ids.length !== certificates.length) {
    return res.status(400).json({ message: 'Hubo un error, un certificado no se encontró, intenta más tarde' })
  }

  try {
    return res.json(await certificatesRepository.remove(certificates))
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}

const SHEET_NAMES = ['DNI', 'NOMBRES Y APELLIDOS', 'AREA O CARGO', 'CURSO', 'EMPRESA', 'MODALIDAD', '# HORAS', 'NOTA', 'FECHA', 'VIGENCIA', 'CERTIFICADO']

export const importExcel = async (req: Request, res: Response): Promise<Response<Object>> => {
  if (req.file?.filename === null || req.file?.filename === undefined) {
    return res.status(400).json({ message: 'Archivo no proporcionado' })
  }

  const filename = `files/${req.file?.filename}`

  try {
    const workbook = xlsx.readFile(filename, { type: 'binary', cellDates: true })
    const sheet = workbook.SheetNames.find((name) => name.toUpperCase() === 'CERTIFICADOS')

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

    const certificatesInDatabase = await certificatesRepository.find()
    const certificatesInExcel = data.map((data: any) => {
      const obj: any = {}
      Object.keys(data).forEach(key => {
        obj[key.toUpperCase()] = data[key]
      })
      const date = obj.FECHA.split(' ').filter((d: string) => d.trim().length > 0).join(', ')
      return {
        fullName: obj['NOMBRES Y APELLIDOS'],
        mark: obj.NOTA,
        dni: String(obj.DNI),
        area: obj['AREA O CARGO'],
        course: obj.CURSO,
        company: obj.EMPRESA,
        modality: obj.MODALIDAD,
        duration: obj['# HORAS'],
        validity: obj.VIGENCIA,
        certification: obj.CERTIFICADO,
        date
      }
    })

    const certificates = certificatesInExcel.filter((certificateExcel, index) => {
      return certificatesInExcel.findIndex(certificate => {
        return certificate.certification === certificateExcel.certification
      }) === index
    })
      .filter(certificateToSave => {
        return certificatesInDatabase.find(certificate => certificate.certification === certificateToSave.certification) === undefined
      })

    const certificatesWithDate = certificates.filter(certificate => certificate.date.trim().length > 0)

    await fs.remove(filename)
    return res.status(200).json(await certificatesRepository.save(certificatesWithDate))
  } catch (error) {
    await fs.remove(filename)
    return res.status(500).json({ message: getErrorMessage(error) })
  }
}
