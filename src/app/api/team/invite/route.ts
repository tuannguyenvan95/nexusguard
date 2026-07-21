import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Missing email or role' },
        { status: 400 }
      )
    }

    // 1. Tạo Test Account tự động từ Ethereal Mail
    const testAccount = await nodemailer.createTestAccount()

    // 2. Cấu hình Transporter với SMTP của Ethereal
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })

    // 3. Chuẩn bị nội dung Email chuẩn phong cách Blueprint
    const htmlContent = `
      <div style="font-family: monospace; background-color: #030712; color: #e5e7eb; padding: 40px; border: 1px solid #d4af37;">
        <h2 style="color: #d4af37; text-transform: uppercase; letter-spacing: 2px;">NexusGuard Protocol</h2>
        <hr style="border-color: #374151; margin: 20px 0;" />
        <p>The system has received a project invitation command.</p>
        <p><strong>Recipient:</strong> ${email}</p>
        <p><strong>Role:</strong> <span style="color: #d4af37;">${role}</span></p>
        <p>You have been granted access to the NexusGuard Dashboard.</p>
        <br/>
        <a href="https://nexusguard.vercel.app/login" style="display: inline-block; background-color: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; color: #d4af37; padding: 10px 20px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Accept Invitation</a>
        <br/><br/>
        <hr style="border-color: #374151; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">This is an automated message from the NexusGuard Treasury & Agentic Management System.</p>
      </div>
    `

    // 4. Gửi Email
    const info = await transporter.sendMail({
      from: '"NexusGuard Admin" <admin@nexusguard.network>',
      to: email,
      subject: `[NexusGuard] Invitation to join as ${role}`,
      text: `You have been invited to join NexusGuard as a ${role}.`,
      html: htmlContent,
    })

    // 5. Lấy URL xem trước (Preview URL)
    const previewUrl = nodemailer.getTestMessageUrl(info)

    // Trả về cho Frontend
    return NextResponse.json({
      success: true,
      previewUrl: previewUrl,
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Server error while sending email' },
      { status: 500 }
    )
  }
}
