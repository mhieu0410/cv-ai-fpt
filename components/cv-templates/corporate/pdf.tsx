import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'

const NAVY = '#1B2A4A'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: '#1a1a1a' },
  header: { backgroundColor: NAVY, paddingHorizontal: 36, paddingVertical: 24, color: '#fff' },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 21, color: '#fff' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  contact: { fontSize: 9, color: 'rgba(255,255,255,0.8)' },
  body: { paddingHorizontal: 36, paddingVertical: 24 },
  section: { marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tick: { width: 3, height: 11, backgroundColor: NAVY },
  sectionTitle: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: NAVY },
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },
  skillsText: { fontSize: 9, color: '#444', lineHeight: 1.6 },
  projRow: { marginBottom: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5, marginBottom: 4 },
})

export function CorporatePdf({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{personal.name}</Text>
          <View style={s.contactRow}>
            {personal.email ? <Text style={s.contact}>{personal.email}</Text> : null}
            {personal.phone ? <Text style={s.contact}>{personal.phone}</Text> : null}
          </View>
        </View>
        <View style={s.body}>
          {education.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionTitleRow}><View style={s.tick} /><Text style={s.sectionTitle}>Học vấn</Text></View>
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
              <View style={s.sectionTitleRow}><View style={s.tick} /><Text style={s.sectionTitle}>Kỹ năng</Text></View>
              <Text style={s.skillsText}>{skills.join('  •  ')}</Text>
            </View>
          )}
          {projects.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionTitleRow}><View style={s.tick} /><Text style={s.sectionTitle}>Dự án</Text></View>
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
              <View style={s.sectionTitleRow}><View style={s.tick} /><Text style={s.sectionTitle}>Hoạt động</Text></View>
              {activities.map((a, i) => <Text key={i} style={s.actText}>{a.description}</Text>)}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

export default CorporatePdf
