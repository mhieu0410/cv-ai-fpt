import {
  Document,
  Font,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { CvData } from '../types'

Font.register({
  family: 'BeVietnamPro',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/BeVietnamPro-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/BeVietnamPro-Bold.ttf',
      fontWeight: 700,
    },
  ],
})

const s = StyleSheet.create({
  page: {
    fontFamily: 'BeVietnamPro',
    fontWeight: 400,
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
  },

  // Header
  headerName: { fontSize: 20, fontFamily: 'BeVietnamPro', fontWeight: 700, marginBottom: 4 },
  headerContact: { fontSize: 9, color: '#555', marginBottom: 2 },

  divider: { borderBottomWidth: 1, borderBottomColor: '#d0d0d0', marginVertical: 10 },

  // Section
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'BeVietnamPro',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    color: '#111',
  },
  section: { marginBottom: 14 },

  // Education
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  eduSub: { fontSize: 9, color: '#444', marginTop: 1 },

  // Skills
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skillChip: {
    fontSize: 9,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    color: '#333',
  },

  // Projects
  projRow: { marginBottom: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },

  // Activities
  actRow: { marginBottom: 4 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5 },
})

export function ClassicPdf({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data

  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <Text style={s.headerName}>{personal.name}</Text>
        {personal.email ? <Text style={s.headerContact}>{personal.email}</Text> : null}
        {personal.phone ? <Text style={s.headerContact}>{personal.phone}</Text> : null}

        <View style={s.divider} />

        {/* Học vấn */}
        {education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Học vấn</Text>
            {education.map((edu, i) => (
              <View key={i} style={s.eduRow}>
                <Text style={s.eduSchool}>{edu.school}</Text>
                <Text style={s.eduSub}>{edu.major}{edu.year ? `  •  ${edu.year}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Kỹ năng */}
        {skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Kỹ năng</Text>
            <View style={s.skillsWrap}>
              {skills.map((skill, i) => (
                <Text key={i} style={s.skillChip}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Dự án */}
        {projects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Dự án</Text>
            {projects.map((proj, i) => (
              <View key={i} style={s.projRow}>
                <Text style={s.projName}>{proj.name}</Text>
                <Text style={s.projDesc}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hoạt động */}
        {activities && activities.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Hoạt động</Text>
            {activities.map((act, i) => (
              <View key={i} style={s.actRow}>
                <Text style={s.actText}>{act.description}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  )
}

export default ClassicPdf
