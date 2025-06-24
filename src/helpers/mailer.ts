import nodemailer from "nodemailer"
import User from "@/models/userModel"
import bcrypt from "bcryptjs"

export const sendEmail = async({email,emailType,userID}:any) =>{
     try {
        const hashedToken = await bcrypt.hash(userID.toString(),10)

        if(emailType==="VERIFY"){
            await User.findByIdAndUpdate(userID,{
            verifyToken: hashedToken,
            verifyTokenExpiry: Date.now() + 3600000
            })
        }
        else if(emailType==="RESET"){
            await User.findByIdAndUpdate(userID,{
            forgotPasswordToken: hashedToken,
            forgotPasswordExpiry: Date.now() + 3600000
            })
        }

        // Looking to send emails in production? Check out our Email API/SMTP product!
        var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.NODEMAILER_USERNAME,
            pass: process.env.NODEMAILER_PASSWORD
        }
        });

        const mailOptions = {
            from : 'ashish@gmail.com',
            to : email,
            subject : emailType === "VERIFY" ? "Verify Your email " : "Reset Your Password",
            html : `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType==="VERIFY"?"verify your email":"reset your password" }</p><br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}` 
        }

        const mailResponse = await transport.sendMail(mailOptions)

        return mailResponse


     } catch (error:any) {
        throw new Error(error.message)
     }
} 
