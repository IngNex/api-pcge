import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

import certificateRoutes from './routes/certificate.routes'
import peopleRoutes from './routes/person.routes'
import userRoutes from './routes/user.routes'
import accountsRoutes from './routes/account.routes'

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.use('/api/v1/certificates', certificateRoutes)
app.use('/api/v1/people', peopleRoutes)
app.use('/api/v1/auth', userRoutes)
app.use('/api/v1/accounts', accountsRoutes)

app.use((_req, res) => {
    const clientIP = _req.ip;
    console.log('Cliente IP:', clientIP);
    res.status(404).json({
        error: {
            code: 403,
            message: "Acceso no autorizado",
            details: "Se ha detectado actividad sospechosa, está prohibido y es monitoreado.",
            suggestions: "Por favor, cese cualquier intento o sera reportado.",
            warning: "La persistencia en este comportamiento resultará en acciones legales."
          }
    });
});

export default app
