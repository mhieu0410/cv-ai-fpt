import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'
import { WatermarkPdf } from '../WatermarkPdf'

const SLATE = '#0F172A'
const CYAN = '#06B6D4'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#1a1a1a' },
  header: { backgroundColor: SLATE, paddingHorizontal: 32, paddingVertical: 26 },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 22, color: '#fff' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  contact: { fontSize: 9, color: CYAN },
  body: { paddingHorizontal: 32, paddingVertical: 24 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: SLATE, marginBottom: 8 },
  prefix: { color: CYAN },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { fontSize: 9, color: '#0E7490', backgroundColor: '#ECFEFF', borderWidth: 0.7, borderColor: '#67E8F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3 },
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },
  projRow: { marginBottom: 8, borderLeftWidth: 2, borderLeftColor: CYAN, paddingLeft: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5, marginBottom: 4 },
})

export function DataSciencePdf({ data, isPro }: { data: CvData; isPro?: boolean }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <WatermarkPdf isPro={isPro} />
        <View style={s.header}>
          <Text style={s.name}>{personal.name}</Text>
          <View style={s.contactRow}>
            {personal.email ? <Text style={s.contact}>{personal.email}</Text> : null}
            {personal.phone ? <Text style={s.contact}>{personal.phone}</Text> : null}
          </View>
        </View>
        <View style={s.body}>
          {skills.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}><Text style={s.prefix}>{'// '}</Text>Kỹ năng</Text>
              <View style={s.skillsWrap}>{skills.map((sk, i) => <Text key={i} style={s.chip}>{sk}</Text>)}</View>
            </View>
          )}
          {education.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}><Text style={s.prefix}>{'// '}</Text>Học vấn</Text>
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
              <Text style={s.sectionTitle}><Text style={s.prefix}>{'// '}</Text>Dự án</Text>
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
              <Text style={s.sectionTitle}><Text style={s.prefix}>{'// '}</Text>Hoạt động</Text>
              {activities.map((a, i) => <Text key={i} style={s.actText}>{a.description}</Text>)}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

export default DataSciencePdf
