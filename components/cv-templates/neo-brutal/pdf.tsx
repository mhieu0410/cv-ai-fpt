import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvData } from '../types'
import { WatermarkPdf } from '../WatermarkPdf'

const ORANGE = '#f26f21'
const YELLOW = '#FCD34D'
const BLACK = '#0a0a0a'

const s = StyleSheet.create({
  page: { fontFamily: 'BeVietnamPro', fontWeight: 400, fontSize: 10, color: BLACK, backgroundColor: '#FFFDF5', padding: 32 },
  header: { backgroundColor: ORANGE, borderWidth: 3, borderColor: BLACK, padding: 16, marginBottom: 20 },
  name: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 24, textTransform: 'uppercase', color: '#fff' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  contactChip: { backgroundColor: '#fff', borderWidth: 2, borderColor: BLACK, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontFamily: 'BeVietnamPro', fontWeight: 700 },
  section: { marginBottom: 16 },
  headingWrap: { alignSelf: 'flex-start', backgroundColor: YELLOW, borderWidth: 2, borderColor: BLACK, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  heading: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: BLACK },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { borderWidth: 2, borderColor: BLACK, backgroundColor: '#fff', paddingHorizontal: 7, paddingVertical: 2, fontSize: 9, fontFamily: 'BeVietnamPro', fontWeight: 700 },
  box: { borderWidth: 2, borderColor: BLACK, backgroundColor: '#fff', padding: 10 },
  cardGap: { marginBottom: 6 },
  rowName: { fontFamily: 'BeVietnamPro', fontWeight: 700, fontSize: 10 },
  rowSub: { fontSize: 9, color: '#555', marginTop: 1 },
  rowDesc: { fontSize: 9, color: '#444', lineHeight: 1.5, marginTop: 2 },
  actText: { fontSize: 9, color: '#444', lineHeight: 1.5 },
})

export function NeoBrutalPdf({ data, isPro }: { data: CvData; isPro?: boolean }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <Document title={personal.name}>
      <Page size="A4" style={s.page}>
        <WatermarkPdf isPro={isPro} />
        <View style={s.header}>
          <Text style={s.name}>{personal.name}</Text>
          <View style={s.contactRow}>
            {personal.email ? <Text style={s.contactChip}>✉ {personal.email}</Text> : null}
            {personal.phone ? <Text style={s.contactChip}>☎ {personal.phone}</Text> : null}
          </View>
        </View>

        {skills.length > 0 && (
          <View style={s.section}>
            <View style={s.headingWrap}><Text style={s.heading}>Kỹ năng</Text></View>
            <View style={s.skillsWrap}>
              {skills.map((sk, i) => <Text key={i} style={s.chip}>{sk}</Text>)}
            </View>
          </View>
        )}

        {education.length > 0 && (
          <View style={s.section}>
            <View style={s.headingWrap}><Text style={s.heading}>Học vấn</Text></View>
            <View style={s.box}>
              {education.map((e, i) => (
                <View key={i} style={i ? s.cardGap : undefined}>
                  <Text style={s.rowName}>{e.school}</Text>
                  <Text style={s.rowSub}>{e.major}{e.year ? `  •  ${e.year}` : ''}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {projects.length > 0 && (
          <View style={s.section}>
            <View style={s.headingWrap}><Text style={s.heading}>Dự án</Text></View>
            {projects.map((p, i) => (
              <View key={i} style={[s.box, { marginBottom: 6 }]}>
                <Text style={s.rowName}>{p.name}</Text>
                <Text style={s.rowDesc}>{p.description}</Text>
              </View>
            ))}
          </View>
        )}

        {activities && activities.length > 0 && (
          <View style={s.section}>
            <View style={s.headingWrap}><Text style={s.heading}>Hoạt động</Text></View>
            <View style={s.box}>
              {activities.map((a, i) => <Text key={i} style={[s.actText, i ? { marginTop: 3 } : {}]}>• {a.description}</Text>)}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

export default NeoBrutalPdf
