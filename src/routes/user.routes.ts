import { Router } from 'express'
import { currentUser, login, register, update } from '../controllers/user.controller'
import { requireAuth } from '../middlewares/require-auth'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/current-user', requireAuth, currentUser)
router.patch('/:id', requireAuth, update)

export default router
