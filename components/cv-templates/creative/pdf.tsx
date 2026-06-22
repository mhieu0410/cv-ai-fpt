import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'
import { WatermarkPdf } from '../WatermarkPdf'

const VIOLET = '#7C3AED'
const PINK = '#DB2777'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#1a1a1a' },
  header: { backgroundColor: VIOLET, paddingHorizontal: 32, paddingVertical: 26, color: '#fff' },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 24, color: '#fff' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  contact: { fontSize: 9, color: '#fff' },
  body: { paddingHorizontal: 32, paddingVertical: 24 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: VIOLET },
  underline: { height: 3, width: 32, backgroundColor: PINK, marginTop: 3, marginBottom: 8 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { fontSize: 9, backgroundColor: '#F3E8FF', color: '#6D28D9', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },
  projRow: { marginBottom: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5, marginBottom: 4 },
})

export function CreativePdf({ data, isPro }: { data: CvData; isPro?: boolean }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <WatermarkPdf isPro={isPro} />
        <View style={s.header}>
          <Text style={s.name}>{personal.name}</Text>
          <View style={s.contactRow}>
            {personal.email ? <Text style={s.contact}>✉ {personal.email}</Text> : null}
            {personal.phone ? <Text style={s.contact}>☎ {personal.phone}</Text> : null}
          </View>
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
              {activities.map((a, i) => <Text key={i} style={s.actText}>{a.description}</Text>)}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

export default CreativePdf
