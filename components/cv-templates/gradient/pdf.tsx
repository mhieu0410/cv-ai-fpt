import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'
import { WatermarkPdf } from '../WatermarkPdf'

// Lưu ý: @react-pdf không hỗ trợ gradient CSS như web. Header dùng màu tím đặc
// (màu giữa của dải gradient) + dải nhấn fuchsia/indigo để gợi hiệu ứng gradient.
const PURPLE = '#7C3AED'
const FUCHSIA = '#C026D3'
const INDIGO = '#4F46E5'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#1a1a1a' },
  headerWrap: { position: 'relative' },
  topStrip: { height: 6, backgroundColor: INDIGO },
  header: { backgroundColor: PURPLE, paddingHorizontal: 32, paddingVertical: 28, color: '#fff' },
  bottomStrip: { height: 6, backgroundColor: FUCHSIA },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 24, color: '#fff' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  contact: { fontSize: 9, color: '#fff' },
  body: { paddingHorizontal: 32, paddingVertical: 24 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: PURPLE },
  underline: { height: 3, width: 40, backgroundColor: FUCHSIA, marginTop: 3, marginBottom: 8, borderRadius: 2 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { fontSize: 9, backgroundColor: '#F3E8FF', color: '#6D28D9', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },
  projRow: { marginBottom: 8, borderLeftWidth: 2, borderLeftColor: '#F0ABFC', paddingLeft: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5, marginBottom: 4 },
})

export function GradientPdf({ data, isPro }: { data: CvData; isPro?: boolean }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <WatermarkPdf isPro={isPro} />
        <View style={s.headerWrap}>
          <View style={s.topStrip} />
          <View style={s.header}>
            <Text style={s.name}>{personal.name}</Text>
            <View style={s.contactRow}>
              {personal.email ? <Text style={s.contact}>✉ {personal.email}</Text> : null}
              {personal.phone ? <Text style={s.contact}>☎ {personal.phone}</Text> : null}
            </View>
          </View>
          <View style={s.bottomStrip} />
        </View>
        <View style={s.body}>
          {skills.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Kỹ năng</Text>
              <View style={s.underline} />
              <View style={s.skillsWrap}>
                {skills.map((sk, i) => <Text key={i} style={s.chip}>{sk}</Text>)}
              </View>
            </View>
          )}
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

export default GradientPdf
