import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, jobTitle, githubUrl, previewUrl, submitterWallet, agent } = body

    // Giả lập thời gian AI xử lý (đọc code, xem preview) khoảng 3 giây
    await new Promise(resolve => setTimeout(resolve, 3000))

    /* 
    =============================================================================
    [THỰC TẾ TRONG PRODUCTION - AI ESCROW PROMPT INJECTION]
    =============================================================================
    // 1. Khởi tạo LLM Client (OpenAI, Anthropic, hoặc mô hình Local Llama 3)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // 2. Fetch mã nguồn từ Github / Lấy HTML từ Preview URL
    const githubData = await fetchGithubRepository(githubUrl);
    
    // 3. Tiêm Ngữ Cảnh (Context Injection) vào System Prompt
    const systemPrompt = \`
      You are an impartial, strict Technical Validator AI for an Escrow platform.
      Your job is to act as a Smart Contract Oracle.
      
      JOB DETAILS:
      - Title: \${jobTitle}
      - Requirements: \${jobRequirements.join(', ')} // (Lấy mảng yêu cầu từ Database)
      - Acceptance Criteria: Code must be responsive, bug-free, and secure.

      SUBMISSION TO EVALUATE:
      - Source Code: \${githubData}
      
      RULES:
      1. If the submission meets ALL requirements exactly, output "DECISION: PASS".
      2. If it misses ANY requirement, output "DECISION: FAIL" and list the issues.
      3. Do NOT show mercy. Be as strict as a smart contract.
    \`;

    // 4. Gọi API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Hoặc Claude 3.5 Sonnet
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please evaluate the submission." }
      ],
      temperature: 0.1, // Nhiệt độ thấp để kết quả ổn định, không "ảo tưởng"
    });

    // const report = completion.choices[0].message.content;
    =============================================================================
    */

    // Trả về báo cáo kết quả từ AI (MOCK DỮ LIỆU ĐỂ DEMO)
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
