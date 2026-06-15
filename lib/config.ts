interface AppConfig {
  /** Giá gói Pro tính bằng VND */
  proPrice: number
  /** Số CV tối đa user free được tạo */
  freeCvLimit: number
  bank: {
    /** Mã BIN ngân hàng theo chuẩn NAPAS/VietQR (mặc định 970415 = Vietcombank) */
    bin: string
    /** Tên ngân hàng nhận thanh toán */
    name: string
    /** Số tài khoản ngân hàng */
    account: string
    /** Tên chủ tài khoản */
    holder: string
  }
}

export const CONFIG: AppConfig = {
  proPrice: Number(process.env.NEXT_PUBLIC_PRO_PRICE_VND) || 1000,
  freeCvLimit: Number(process.env.NEXT_PUBLIC_FREE_CV_LIMIT) || 5,
  bank: {
    bin: process.env.NEXT_PUBLIC_BANK_BIN ?? '970415',
    name: process.env.NEXT_PUBLIC_BANK_NAME ?? '',
    account: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? '',
    holder: process.env.NEXT_PUBLIC_BANK_HOLDER ?? '',
  },
}
