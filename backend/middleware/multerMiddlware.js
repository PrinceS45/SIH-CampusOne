import multer from "multer" ;

// use memory storage efficient for cloud storage 

const storage = multer.memoryStorage() ;

const uploadMiddleware = multer({storage}) ; 

export default uploadMiddleware ;