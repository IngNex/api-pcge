import multer, { diskStorage } from 'multer'

const IMAGE_ROOT = 'files'

const renameImage = (_: any, file: Express.Multer.File, callback: Function): void => {
  const fileName: string = file.originalname
  callback(null, `${new Date().toISOString().replace(/:/g, '-')}-${fileName}`)
}

const fileFilter = (_: any, file: Express.Multer.File, callback: Function): void => {
  if (!file.originalname.match(/\.(xlsx|xlsm|xls|xlt|xlsb)$/)) {
    return callback(new Error('Invalid format type'), false)
  }

  return callback(null, true)
}

const upload = multer({
  storage: diskStorage({
    destination: `${IMAGE_ROOT}`,
    filename: renameImage
  }),
  fileFilter
})

export default upload
