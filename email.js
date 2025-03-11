import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, link }) {
  console.log(`to: ${to}\nsubject: ${subject}`)
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_MY_EMAIL_NAME} <${process.env.EMAIL_MY_EMAIL_ADDRESS}>`,
      to: [to],
      subject: subject,
      html: `
      <p>Your email is verified, please click the link below to login:</p>
      <a href="${link}">${link}</a>
      `,
    })
    if (error) {
      return Response.json({ error }, { status: 500 })
    }
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err }, { status: 500 })
  }
}
