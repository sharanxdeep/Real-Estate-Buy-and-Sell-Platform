import express, { json, response } from "express";
import { createRequire } from "module";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/signup", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // console.log(req.body)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === "P2002") {
      error.statusCode = 400;
      error.message = "Email already exists";
    }
    next(error);
  }
});

router.post("/login",async (req,res)=>{
  const {email, password} = req.body;
  try {
    const user = await prisma.user.findUnique({where:{ email } });
    if(!user){
      return res.status(400).json({success:false, message:"User not found"});
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if(!validPassword){
      return res.status(400).json({success:false, message:"Incorrect password"});
    }

    res.json({success:true, message:"Login successfull"});

  } catch (error) {
    res.status(500).json({success:false, message:"Something went wrong"});
  }
})

export default router;
