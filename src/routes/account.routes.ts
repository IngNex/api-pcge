import { Router } from 'express'
import { create, getAll, importExcel, remove, update, removeMultiple } from '../controllers/accounts.controller'
import upload from '../helpers/file.helper'
import { requireAuth } from '../middlewares/require-auth'

const router = Router()


router.get('', requireAuth, getAll)
router.post('', requireAuth, create)
router.put('/:id', update)
router.patch('/remove-multiple', requireAuth, removeMultiple)
router.delete('/:id', requireAuth, remove)

router.post('/import-excel', requireAuth, upload.single('excel-file'), importExcel)

export default router
