import nodemailer from "nodemailer"
const transporter=nodemailer.createTransport({ // creating a transporter
    service:"gmail", // transporter will use gmail service
    auth:{  // connecting the transporter to the verified email, from this it will send the email
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendEmail=async ({to,subject,html})=>{ // creating the send email function
try{
    const info=await transporter.sendMail({ // function will use the defined transporter and sendemail
        from: `"Ecomora Team" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    })
    console.log("Email sent",info.messageId)
}catch(err)
{
   console.error("Email error:", err.message);
}
}
export default sendEmail