import express, { json, response } from "express";
import { createRequire } from "module";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const router = express.Router();
const prisma = new PrismaClient();

router.post('/signup',async (req,res)=>{
    try {
        const {firstName,lastName, email, password}=req.body;
        // console.log(req.body)
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser = await prisma.user.create({
            data:{
                firstName,
                lastName,
                email,
                password:hashedPassword,
            },
        });

        res.status(201).json({message:"User created successfully"});
    } catch (error) {
        res.status(500).json(error.message);
    }
}
);

export default router;