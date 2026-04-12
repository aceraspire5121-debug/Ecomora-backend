import cloudinary from "../utils/cloudinary.js"
import { Product } from "../models/productModel.js"
import streamifier from "streamifier"

const uploadToCloudinary = (buffer,originalname) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            { folder: "products", // is name ka folder ban raha hai cloudinary me jiske andar images save ho rahi hai jakar
                public_id: `${Date.now()}-${originalname}`, // unique id hogi har ek image ki
             },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )

        streamifier.createReadStream(buffer).pipe(stream)

    })
}

export const addProduct = async (req, res) => {

    try {
      const uploads=req.files.map(file=>uploadToCloudinary(file.buffer,file.originalname)) // uploadtoCloudinary returns promises so uploads become an array of promises
      const result=await Promise.all(uploads) // here we wait for each promise to resolve, and promises will be resolved parallely not one by one so using this over forin loops make api 3 to 5 times faster as promises resolve simultaneously
      const imageurls=result.map(r=>({
        url:r.secure_url,
        public_id: r.public_id
     }))
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            stock: req.body.stock,
            images: imageurls
        })
        res.status(201).json({success:true,message:"product added successfully",product})
    } catch (error) {
        res.status(500).json({message:error.message})
    }

}

export const getProducts= async (req,res)=>{
    try{ 
        const query={}
        if(req.query.category)
            query.category=req.query.category;
        if(req.query.price)
        {
            const [min,max]=req.query.price.split(",").map(Number)
            query.price={};
            if(min)
                query.price.$gte=min;
            if(max)
                query.price.$lte=max;
        }
        if(req.query.keyword)
        {
            query.name={
                $regex:req.query.keyword, // will not find exact word instead search for partial or similar matching, if we given iphone as keyword then it will consider all the names which have iphone in it
                $options:"i" // i means case insensitive
            }
        }
      
        // Object will look like this
//        query = {
//   category: "Mobile",
//   price: { $gte: 10000, $lte: 50000 },
//   name: { $regex: "iphone", $options: "i" }
// }

    const page=Number(req.query.page)||1; // since req.query.page is string when comes , so we change it into number
    const limit=Number(req.query.limit)||8;
    const skip=(page-1)*limit; // suppose our limit is 3 per page, for 4th page product should be skipped ((4-1)*3=9)
    const products=await Product.find(query).sort({createdAt:-1}).skip(skip).limit(limit) // it will skip the products as per skip value and will fetch only limited products as per limit value, createdAt -1 sorts according to the latest product means latest one will come first (all documents are fetched then sorted according to the newest on top and oldest at bottom and then skipping is done and then limited products are selected)
    const totalDocuments=await Product.countDocuments();
    res.status(200).json({success:true,count:products.length,totalDocuments,currentPage:page,totalPages:Math.ceil(totalDocuments/limit),products})
    }catch(error)
    {
     res.status(500).json({success:false,message:error.message})
    }
}

export const getSingleProduct=async (req,res)=>{
     try {

        const product=await Product.findById(req.params.id)
        
            if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

        res.status(200).json({success:true,product})
     } catch (error) {
        res.status(500).json({success:false,message:error.message})
     }
}

export const updateProduct=async (req,res)=>{
 
    try {
         const product=await Product.findById(req.params.id)

          if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
 
    let imageurls=product.images // old images

if(req.files && req.files.length>0) // agar user ne new image upload kari to images section hoga, agar bo hoga to upload.array chalgea jisse req.files me available ho jata hai images ka data
{
    const uploads=req.files.map(file=>uploadToCloudinary(file.buffer,file.originalname)) // uploadtoCloudinary returns promises so uploads become an array of promises
      const result=await Promise.all(uploads) // here we wait for each promise to resolve, and promises will be resolved parallely not one by one so using this over forin loops make api 3 to 5 times faster as promises resolve simultaneously
      imageurls=result.map(r=>({
        url:r.secure_url,
        public_id: r.public_id
     }))

     for (let img of product.images) {
        if(img.public_id){
         await cloudinary.uploader.destroy(img.public_id);
        }
       } //new save ho gyi to purani delte kardo images cloudinary se
}

    const newProduct=await Product.findByIdAndUpdate(req.params.id,{...req.body,images:imageurls},{
        new: true, // updated data return karega
        runValidators: true, // schema validation chalega
      })
      res.status(200).json({success:true,newProduct})
        
    } catch (error) {
         res.status(500).json({success:false,message:error.message})
    }
   

}

export const deleteProduct=async (req,res)=>{
 
    try {
        const product=await Product.findByIdAndDelete(req.params.id);

        if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({success:true,message:"Product deleted successfully"})
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
    }
}

// since we have buffer which contains the actual bytes of the image and dont have any path since it is not stored on any disk (if it was stored on any folder like upload then there exist a path like root/upload/a.png) but storing in ram means storing the images in bytes form
//cloudinary can work with path and if no path then you use stream in which this binary data (0010110) is sends into chunks to the cloudinary and there it gets stored

// since we dont have a path so we choosed stream

// memoryStorage → no file path
// Cloudinary usually expects a path
// solution → send buffer as stream

//binary data is converted into small chunks and then send to cloudinary where it gets stored, so sending it into chunks is known as sending buffer as stream to cloudinary

// multiple images will be stored as buffer in req.files
// req.files = [
//  { buffer: <Buffer ...> }, image1
//  { buffer: <Buffer ...> }, image2 
//  { buffer: <Buffer ...> }, image 3
// ]

// so we are taking image buffer as file hence it will work fine for multiple images