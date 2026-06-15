import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'

const GOLD = '#B08D57'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#2a2a2a', paddingTop: 40, paddingBottom: 40, paddingHorizontal: 48 },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: '#3a3a3a', textAlign: 'center' },
  contactRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 },
  contact: { fontSize: 9, color: GOLD },
  rule: { height: 1, width: 80, backgroundColor: GOLD, alignSelf: 'center', marginTop: 12 },
  section: { marginTop: 20 },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: GOLD, textAlign: 'center', marginBottom: 8 },
  eduRow: { marginBottom: 6, textAlign: 'center' },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, textAlign: 'center' },
  eduSub: { fontSize: 9, color: '#777', marginTop: 1, textAlign: 'center' },
  skillsText: { fontSize: 9, color: '#444', lineHeight: 1.6, textAlign: 'center' },
  projRow: { marginBottom: 8, textAlign: 'center' },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2, textAlign: 'center' },
  projDesc: { fontSize: 9, color: '#555', lineHeight: 1.5, textAlign: 'center' },
  actText: { fontSize: 9, color: '#555', lineHeight: 1.5, marginBottom: 4, textAlign: 'center' },
})

export function ElegantPdf({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{personal.name}</Text>
        <View style={s.contactRow}>
          {personal.email ? <Text style={s.contact}>{personal.email}</Text> : null}
          {personal.phone ? <Text style={s.contact}>{personal.phone}</Text> : null}
        </View>
        <View style={s.rule} />

        {education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Học vấn</Text>
            {education.map((e, i) => (
              <View key={i} style={s.eduRow}>
                <Text style={s.eduSchool}>{e.school}</Text>
                <Text style={s.eduSub}>{e.major}{e.year ? `  •  ${e.year}` : ''}</Text>
              </View>
            ))}
          </View>
        )}
        {skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Kỹ năng</Text>
            <Text style={s.skillsText}>{skills.join('  ·  ')}</Text>
          </View>
        )}
        {projects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Dự án</Text>
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
            {activities.map((a, i) => <Text key={i} style={s.actText}>{a.description}</Text>)}
          </View>
        )}
      </Page>
    </Document>
  )
}

export default ElegantPdf
