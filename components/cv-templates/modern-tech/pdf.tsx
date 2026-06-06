import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { CvData } from '../types'

// Font 'BeVietnamPro' đã được Font.register trong classic/pdf.tsx (luôn được load
// cùng qua registry). Không đăng ký lại ở đây để tránh đăng ký trùng lặp.

const ORANGE = '#F37021'
const BLUE = '#0072BC'
const GREEN = '#00A651'

const s = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'BeVietnamPro',
    fontWeight: 400,
    fontSize: 10,
    color: '#1a1a1a',
  },

  // Sidebar (cột trái)
  sidebar: {
    width: '35%',
    minHeight: '100%',
    backgroundColor: ORANGE,
    color: '#fff',
    padding: 20,
  },
  sidebarName: {
    fontSize: 22,
    fontFamily: 'BeVietnamPro',
    fontWeight: 700,
    color: '#fff',
    marginBottom: 18,
  },
  sidebarContact: { fontSize: 9, color: '#fff', marginBottom: 3 },
  sidebarDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 14,
  },
  sidebarHeading: {
    fontSize: 11,
    fontFamily: 'BeVietnamPro',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#fff',
    marginBottom: 8,
  },
  skillItem: { fontSize: 9, color: '#fff', marginBottom: 5 },

  // Content (cột phải)
  content: {
    width: '65%',
    backgroundColor: '#fff',
    padding: 24,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: BLUE,
    marginBottom: 4,
  },
  sectionUnderline: {
    borderBottomWidth: 1.5,
    borderBottomColor: GREEN,
    width: 36,
    marginBottom: 10,
  },

  // Học vấn
  eduRow: { marginBottom: 6 },
  eduSchool: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, color: '#1a1a1a' },
  eduSub: { fontSize: 9, color: '#666', marginTop: 1 },

  // Dự án
  projRow: { marginBottom: 8 },
  projName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10, color: '#1a1a1a', marginBottom: 2 },
  projDesc: { fontSize: 9, color: '#444', lineHeight: 1.5 },

  // Hoạt động
  actRow: { marginBottom: 4 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5 },
})

export function ModernTechPdf({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data

  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>

        {/* Cột trái — sidebar */}
        <View style={s.sidebar}>
          <Text style={s.sidebarName}>{personal.name}</Text>

          {personal.email ? <Text style={s.sidebarContact}>Email: {personal.email}</Text> : null}
          {personal.phone ? <Text style={s.sidebarContact}>SĐT: {personal.phone}</Text> : null}

          <View style={s.sidebarDivider} />

          {skills.length > 0 && (
            <View>
              <Text style={s.sidebarHeading}>Kỹ năng</Text>
              {skills.map((skill, i) => (
                <Text key={i} style={s.skillItem}>• {skill}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Cột phải — nội dung */}
        <View style={s.content}>

          {/* Học vấn */}
          {education.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Học vấn</Text>
              <View style={s.sectionUnderline} />
              {education.map((edu, i) => (
                <View key={i} style={s.eduRow}>
                  <Text style={s.eduSchool}>{edu.school}</Text>
                  <Text style={s.eduSub}>{edu.major}{edu.year ? `  •  ${edu.year}` : ''}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dự án */}
          {projects.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Dự án</Text>
              <View style={s.sectionUnderline} />
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
              <View style={s.sectionUnderline} />
              {activities.map((act, i) => (
                <View key={i} style={s.actRow}>
                  <Text style={s.actText}>{act.description}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </Page>
    </Document>
  )
}

export default ModernTechPdf
