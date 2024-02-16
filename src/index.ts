import 'reflect-metadata'
import app from './app'
import AppDataSource from './db'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT ?? 3000

AppDataSource.initialize().then(() => {
  console.log('Database has been initialized')

  app.listen(PORT, () => {
    console.log(`Server has Started On Port ${PORT}`)
  })
}).catch((error) => {
  console.log(error)
  console.log('Database initialization Failed!!')
})
