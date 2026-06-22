import { Text } from '@react-pdf/renderer'

export function WatermarkPdf({ isPro }: { isPro?: boolean }) {
  if (isPro) return null
  return (
    <Text
      style={{
        position: 'absolute',
        top: '40%',
        left: '20%',
        fontSize: 40,
        color: 'rgba(180, 180, 180, 0.25)',
        transform: 'rotate(-45deg)',
        fontFamily: 'BeVietnamPro',
        fontWeight: 700,
        zIndex: 9999,
      }}
    >
      TẠO BỞI CV AI FPT
    </Text>
  )
}
