console.log("Starting the email test...");
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: "tms00002025@gmail.com", // Your email address
    pass: "tzdnwrpamhmpspbt", // Your app-specific password
  },
});

const testEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: "tms00002025@gmail.com", // Sender address
      to: "chandanjaincj93@gmail.com", // Receiver's email
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // Plain text body
    });
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error occurred while sending email:", error.message);
  }
};

testEmail()
  .then(() => {
    console.log("Test email function executed.");
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
  });
