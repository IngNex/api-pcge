import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  jwt.verify(token, 'secret', (err, user): any => {
    if (err) return res.status(403).json({ message: 'Forbidden' })

    req.user = user

    next()
  })
}
