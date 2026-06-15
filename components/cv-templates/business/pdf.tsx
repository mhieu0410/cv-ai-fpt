import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'

const NAVY = '#1E3A5F'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#1a1a1a', paddingTop: 36, paddingBottom: 36, paddingHorizontal: 40 },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 22, color: NAVY },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  contact: { fontSize: 9, color: '#555' },
  topRule: { borderBottomWidth: 2, borderBottomColor: NAVY, marginTop: 10 },
  section: { marginTop: 14 },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: NAVY, borderBottomWidth: 1, borderBottomColor: '#d6dde6', paddingBottom: 3, marginBottom: 8 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { fontSize: 9, color: NAVY, borderWidth: 0.7, borderColor: '#9fb0c4', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3 },
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },
  projRow: { marginBottom: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5, marginBottom: 4 },
})

export function BusinessPdf({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{personal.name}</Text>
        <View style={s.contactRow}>
          {personal.email ? <Text style={s.contact}>{personal.email}</Text> : null}
          {personal.phone ? <Text style={s.contact}>• {personal.phone}</Text> : null}
        </View>
        <View style={s.topRule} />

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
            <View style={s.skillsWrap}>{skills.map((sk, i) => <Text key={i} style={s.chip}>{sk}</Text>)}</View>
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

export default BusinessPdf
