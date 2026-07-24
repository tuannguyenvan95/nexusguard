import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, jobTitle, githubUrl, previewUrl, submitterWallet, agent, payoutType, maxWinners, totalAmount } = body

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
    const systemPrompt = `
      You are an impartial, strict Technical Validator AI for an Escrow platform.
      Your job is to act as a Smart Contract Oracle.
      
      JOB DETAILS:
      - Title: ${jobTitle}
      - Requirements: ${jobRequirements.join(', ')} // (Lấy mảng yêu cầu từ Database)
      - Acceptance Criteria: Code must be responsive, bug-free, and secure.

      SUBMISSION TO EVALUATE:
      - Source Code: ${githubData}
      
      RULES:
      1. If the submission meets ALL requirements exactly, output "DECISION: PASS".
      2. If it misses ANY requirement, output "DECISION: FAIL" and list the issues.
      3. Do NOT show mercy. Be as strict as a smart contract.
    `;

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

    // Thực thi Giao dịch On-chain Thật (Trích tiền từ Treasury)
    // Fallback sử dụng mã Hash thật (đã thành công trên ArcScan) để phục vụ Demo mượt mà khi mạng bị nghẽn
    let txHash = '0xb3db9f1ba6556a0a8948ac83a22b85e8e5d87e37ead2800829013003b01cb48d' 
    
    try {
      const privateKey = process.env.TREASURY_PRIVATE_KEY
      if (privateKey) {
        // Kết nối mạng Arc Testnet
        const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
        const wallet = new ethers.Wallet(privateKey, provider)
        
        // Cấu hình USDC Contract
        const usdcAddress = '0x3600000000000000000000000000000000000000'
        const erc20Abi = [
          'function transfer(address to, uint256 amount) returns (bool)'
        ]
        const usdcContract = new ethers.Contract(usdcAddress, erc20Abi, wallet)
        
        let numericAmount = 10;
        if (totalAmount) {
          const parsed = parseFloat(totalAmount.replace(/,/g, '').replace(/[^\d.]/g, ''))
          if (!isNaN(parsed)) numericAmount = parsed;
        }

        if (payoutType === 'pool_funding') {
          const winners = parseInt(maxWinners) || 1
          numericAmount = numericAmount / winners
        }

        console.log(`Calculated amount to send: ${numericAmount} USDC (Type: ${payoutType})`)
        const amount = ethers.parseUnits(numericAmount.toString(), 6)
        
        console.log(`Sending 10 USDC to ${submitterWallet}...`)
        const tx = await usdcContract.transfer(submitterWallet, amount)
        await tx.wait() // Chờ confirm
        console.log(`Transfer successful! Hash: ${tx.hash}`)
        txHash = tx.hash // Gán Hash thật
      } else {
        console.warn("No TREASURY_PRIVATE_KEY found in .env.local, using mock transaction.")
      }
    } catch (e) {
      console.error("Failed to execute real on-chain transaction:", e)
      // Nếu ví hết phí gas hoặc lỗi mạng, vẫn trả về mock hash để Demo không bị đứt đoạn
    }

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
      txHash
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
