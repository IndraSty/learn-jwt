import { prisma } from "../application/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res, next) => {
    try {
        const user = req.body;
    
        const countUser = await prisma.users.count({
            where: {
                email: user.email
            }
        });
    
        if(countUser === 1){
            res.status(400).json({error: "Email Sudah digunakan"});
        }
    
        user.password = await bcrypt.hash(user.password, 10);
    
        const createUser = await prisma.users.create({
            data: user,
            select: {
                email: true,
                name: true,
                gender: true,
                createdAt: true
            }
        });
    
        return res.status(200).json({
            data: createUser,
            message: "Register Berhasil, Silahkan login"
        });
    } catch (error) {
        console.log(error);
    }
}

const login = async (req, res, next) => {
    try {
        const loginReq = req.body;
    
        const user = await prisma.users.findUnique({
            where: {
                email: loginReq.email
            },
            select: {
                email: true,
                password: true,
                name: true
            }
        });
    
        if(!user) {
            res.status(400).json("Email Anda Belum Terdaftar!")
        }
    
        const isPasswordValid = await bcrypt.compare(loginReq.password, user.password);
        if(!isPasswordValid) res.status(400).json("Password Anda Salah");
    
        const email = user.email;
        const name = user.name;
    
        const accessToken = jwt.sign({email, name}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });
    
        const refreshToken = jwt.sign({email, name}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
    
        await prisma.users.update({
            data: {
                refreshToken: refreshToken
            }, 
            where: {
                email: user.email
            }
        });
    
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
    
        res.status(200).json({accessToken});
    } catch (error) {
        res.status(404).json({
            msg: "Email tidak ditemukan"
        })
    }
   
}

const logout = async (req, res, next) => {
    const refreshToken = res.cookies.refreshToken;
    if(!refreshToken) return res.status(204)

    const email = req.email;
    const user = await prisma.users.findUnique({
        where: {
            email: email
        }
    });

    if(!user) res.status(404).json("User tidak ditemukan!");

    await prisma.users.update({
        where: {
            email: email
        },
        data: {
            refreshToken: null
        },
        select: {
            email: true
        }
    });

    res.clearCookie('refreshToken');
    res.status(200).json({
        response: {
            status: 200,
            message: "Ok",
        },
        message: "Logout Berhasil"
    });
}

const get = async (req, res, next) => {
    try {
        const email = req.email;
    
        const user = await prisma.users.findUnique({
            where: {
                email: email
            },
            select: {
                email: true,
                name: true,
                createdAt: true,
                updateAt: true
            }
        });
    
        res.status(200).json({
            response: {
                status: 200,
                message: "Ok",
            },
            data: user
        });
    } catch (error) {
        res.status(404).json("User Tidak Ditemukan")
    }

}

export default {
    register,
    login,
    logout,
    get
}
