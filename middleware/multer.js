import multer from "multer";
const storage=multer.memoryStorage()
console.log("hii")
const upload=multer({
     storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export default upload


//using this the file is parsed and available in req.file

//When a file is uploaded using multer.memoryStorage(), the file is stored temporarily in RAM and available in req.file.buffer. After the request finishes, the req object is destroyed, so the reference to that buffer is removed. Then Node.js's garbage collector frees that memory.

//since the image is stored in ram, the buffer contains the actual binary bytes of the image (0110001100...) 