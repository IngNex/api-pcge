import { Router } from 'express'
import { create, getAll, getAllByDni, getById, importExcel, remove, update, removeMultiple, getByCod } from '../controllers/certificate.controller'
import upload from '../helpers/file.helper'
import { requireAuth } from '../middlewares/require-auth'

const router = Router()

router.get('/dni/:dni', getAllByDni)

router.get('', requireAuth, getAll)
router.get('/:id', getById)
router.get('/cod/:cod', getByCod)
router.post('', requireAuth, create)
router.put('/:id', update)
router.patch('/remove-multiple', requireAuth, removeMultiple)
router.delete('/:id', requireAuth, remove)

router.post('/import-excel', requireAuth, upload.single('excel-file'), importExcel)

export default router
