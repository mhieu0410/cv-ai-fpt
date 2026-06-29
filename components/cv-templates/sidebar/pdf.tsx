import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'
import { WatermarkPdf } from '../WatermarkPdf'

const TEAL = '#0F766E'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#1a1a1a', flexDirection: 'row' },
  // Cột trái
  sidebar: { width: '36%', height: '100%', backgroundColor: TEAL, color: '#fff', paddingHorizontal: 16, paddingVertical: 28 },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 18, color: '#fff', lineHeight: 1.2 },
  sideBlock: { marginTop: 18 },
  sideHeading: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: '#CFE8E5', marginBottom: 6 },
  sideText: { fontSize: 9, color: '#FFFFFF', marginBottom: 3 },
  sideSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  sideChip: { backgroundColor: '#2C8B83', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8.5, color: '#fff' },
  // Cột phải
  main: { flex: 1, paddingHorizontal: 22, paddingVertical: 28 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: TEAL },
  underline: { height: 2, width: 32, backgroundColor: TEAL, marginTop: 3, marginBottom: 8 },
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },
  projRow: { marginBottom: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5, marginBottom: 4 },
})

export function SidebarPdf({ data, isPro }: { data: CvData; isPro?: boolean }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <WatermarkPdf isPro={isPro} />

        {/* Cột trái */}
        <View style={s.sidebar}>
          <Text style={s.name}>{personal.name}</Text>

          <View style={s.sideBlock}>
            <Text style={s.sideHeading}>Liên hệ</Text>
            {personal.email ? <Text style={s.sideText}>✉ {personal.email}</Text> : null}
            {personal.phone ? <Text style={s.sideText}>☎ {personal.phone}</Text> : null}
          </View>

          {skills.length > 0 && (
            <View style={s.sideBlock}>
              <Text style={s.sideHeading}>Kỹ năng</Text>
              <View style={s.sideSkills}>
                {skills.map((sk, i) => <Text key={i} style={s.sideChip}>{sk}</Text>)}
              </View>
            </View>
          )}
        </View>

        {/* Cột phải */}
        <View style={s.main}>
          {education.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Học vấn</Text>
              <View style={s.underline} />
              {education.map((e, i) => (
                <View key={i} style={s.eduRow}>
                  <Text style={s.eduSchool}>{e.school}</Text>
                  <Text style={s.eduSub}>{e.major}{e.year ? `  •  ${e.year}` : ''}</Text>
                </View>
              ))}
            </View>
          )}
          {projects.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Dự án</Text>
              <View style={s.underline} />
              {projects.map((p, i) => (
                <View key={i} style={s.projRow}>
                  <Text style={s.projName}>{p.name}</Text>
                  <Text style={s.projDesc}>{p.description}</Text>
                </View>
              ))}
            </View>
          )}
          {activities && activities.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Hoạt động</Text>
              <View style={s.underline} />
              {activities.map((a, i) => <Text key={i} style={s.actText}>• {a.description}</Text>)}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

export default SidebarPdf
