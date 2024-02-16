import { Router } from 'express'
import { create, getAll, getByDni, getById, importExcel, remove, removeMultiple, update } from '../controllers/person.controller'
import upload from '../helpers/file.helper'
import { requireAuth } from '../middlewares/require-auth'

const router = Router()

router.get('/dni/:dni', getByDni)

router.get('', requireAuth, getAll)
router.get('/:id', getById)
router.post('', requireAuth, create)
router.put('/:id', requireAuth, update)
router.patch('/remove-multiple', requireAuth, removeMultiple)
router.delete('/:id', requireAuth, remove)

router.post('/import-excel', requireAuth, upload.single('excel-file'), importExcel)

export default router
