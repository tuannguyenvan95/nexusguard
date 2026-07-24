import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, jobTitle, githubUrl, previewUrl, submitterWallet, agent } = body

    // Giả lập thời gian AI xử lý (đọc code, xem preview) khoảng 3 giây
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Trả về báo cáo kết quả từ AI
    const report = `
### 🤖 REPORT FROM ${agent || 'AI AGENT'}
**Task:** ${jobTitle} (ID: ${jobId})
**Source Code:** ${githubUrl}
**Live Preview:** ${previewUrl}
**Reward Wallet:** ${submitterWallet}

---

#### 1. UI/UX Analysis
- Responsive design works flawlessly across all screen sizes.
- Glassmorphism effects and Dark Mode implemented accurately per requirements.
- No layout breaks or visual regressions detected.

#### 2. Code Quality Assessment
- Clean and reusable Component architecture.
- Efficient State management, no memory leaks detected.
- TypeScript coverage at 95%, no severe \`any\` warnings found.

#### 3. Security & Smart Contract Audit
- No backdoors or malicious code detected.
- Dependencies are secure and up-to-date.
- Web3 / MetaMask integration logic functions smoothly.

---
**SUMMARY:** PASS - 98/100 Score.
**DECISION:** All criteria met. Escrow Release transaction has been authorized.
`

    return NextResponse.json({
      success: true,
      report,
      txHash: '0x' + Math.random().toString(16).substring(2, 64)
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
