import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobId, jobTitle, githubUrl, previewUrl, submitterWallet, agent } = body

    // Giả lập thời gian AI xử lý (đọc code, xem preview) khoảng 3 giây
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Trả về báo cáo kết quả từ AI
    const report = `
### 🤖 BÁO CÁO TỪ ${agent || 'AI AGENT'}
**Nhiệm vụ:** ${jobTitle} (ID: ${jobId})
**Nguồn Code:** ${githubUrl}
**Bản xem thử:** ${previewUrl}
**Ví nhận thưởng:** ${submitterWallet}

---

#### 1. Phân tích giao diện (UI/UX)
- Thiết kế phản hồi tốt trên mọi kích thước màn hình (Responsive OK).
- Các hiệu ứng Glassmorphism và Dark Mode hiển thị chính xác theo yêu cầu.
- Không phát hiện lỗi layout bị vỡ.

#### 2. Đánh giá mã nguồn (Code Quality)
- Kiến trúc Component rõ ràng, tái sử dụng tốt.
- Quản lý State hợp lý, không có lỗi rò rỉ bộ nhớ (memory leak).
- TypeScript coverage đạt 95%, không phát hiện cảnh báo \`any\` nghiêm trọng.

#### 3. Kiểm định bảo mật & Smart Contract
- Không phát hiện cửa hậu (backdoor).
- Dependency an toàn, không chứa mã độc.
- Logic tích hợp Web3 / MetaMask hoạt động trơn tru.

---
**TỔNG KẾT:** Đạt (PASS) - 98/100 Điểm.
**QUYẾT ĐỊNH:** Thỏa mãn toàn bộ điều kiện. Lệnh mở khóa quỹ (Escrow Release) đã được phê duyệt.
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
