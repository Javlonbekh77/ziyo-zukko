import re

def clean_team_section():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/components/TeamSection.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace defaultTeamMembers array with empty array
    content = re.sub(
        r'const defaultTeamMembers:\s*TeamMember\[\]\s*=\s*\[[\s\S]*?\n\];',
        'const defaultTeamMembers: TeamMember[] = [];',
        content
    )
    # Replace initial state
    content = content.replace(
        'useState<TeamMember[]>(defaultTeamMembers);',
        'useState<TeamMember[]>([]);'
    )
    # Replace merged with fetched
    content = content.replace(
        'const merged = [...fetched, ...defaultTeamMembers];\n            setTeamMembersList(merged);\n            setLocalCache("teachers_home_cache", merged);',
        'setTeamMembersList(fetched);\n            setLocalCache("teachers_home_cache", fetched);'
    )
    content = content.replace(
        'const merged = [...fetched, ...defaultTeamMembers];\n              setTeamMembersList(merged);\n              setLocalCache("teachers_home_cache", merged);',
        'setTeamMembersList(fetched);\n              setLocalCache("teachers_home_cache", fetched);'
    )
    
    # Hide section if teamMembersList is empty
    if 'if (teamMembersList.length === 0) return null;' not in content:
        target = '  // Leadership members ALWAYS come first in "Barchasi"!'
        replacement = '  // Agar bazada o\'qituvchilar hali kiritilmagan bo\'lsa, bo\'sh qoldiramiz (placeholder chiqarilmaydi)\n  if (teamMembersList.length === 0) {\n    return null;\n  }\n\n  // Leadership members ALWAYS come first in "Barchasi"!'
        content = content.replace(target, replacement)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("TeamSection.tsx cleaned successfully.")

def clean_universities_section():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/components/UniversitiesSection.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace defaultGraduates array with empty array
    content = re.sub(
        r'const defaultGraduates:\s*GraduateItem\[\]\s*=\s*\[[\s\S]*?\n\];',
        'const defaultGraduates: GraduateItem[] = [];',
        content
    )
    # Replace initial state
    content = content.replace(
        'const [graduates, setGraduates] = useState<GraduateItem[]>(defaultGraduates);',
        'const [graduates, setGraduates] = useState<GraduateItem[]>([]);'
    )
    # Hide section if graduates is empty
    if 'if (graduates.length === 0) return null;' not in content:
        target = '  return (\n    <section id="graduates"'
        replacement = '  // Agar bazada bitiruvchilar hali kiritilmagan bo\'lsa, placeholder chiqarilmaydi\n  if (graduates.length === 0) {\n    return null;\n  }\n\n  return (\n    <section id="graduates"'
        content = content.replace(target, replacement)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("UniversitiesSection.tsx cleaned successfully.")

def clean_results_section():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/components/ResultsSection.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace defaultStatsList and allCertificatesList
    content = re.sub(
        r'const defaultStatsList:\s*StatItem\[\]\s*=\s*\[[\s\S]*?\n\];',
        'const defaultStatsList: StatItem[] = [];',
        content
    )
    content = re.sub(
        r'const allCertificatesList:\s*CertCardItem\[\]\s*=\s*\[[\s\S]*?\n\];',
        'const allCertificatesList: CertCardItem[] = [];',
        content
    )
    content = content.replace(
        'const [siteStats, setSiteStats] = useState<StatItem[]>(defaultStatsList);',
        'const [siteStats, setSiteStats] = useState<StatItem[]>([]);'
    )
    if 'if (siteStats.length === 0 && adminCerts.length === 0) return null;' not in content:
        target = '  return (\n    <section id="results"'
        replacement = '  // Agar natijalar va sertifikatlar bazada bo\'lmasa, placeholder chiqarilmaydi\n  if (siteStats.length === 0 && adminCerts.length === 0) {\n    return null;\n  }\n\n  return (\n    <section id="results"'
        content = content.replace(target, replacement)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("ResultsSection.tsx cleaned successfully.")

def clean_testimonials():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/components/TestimonialsSection.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace(
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
        '/rasmlar/2026-10-02 17.58.36.jpg'
    )
    content = content.replace(
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
        '/rasmlar/2026-10-02 17.58.46.jpg'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("TestimonialsSection.tsx updated with real school photos.")

def clean_testimonials_page():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/app/testimonials/page.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace(
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
        '/rasmlar/2026-10-02 17.58.36.jpg'
    )
    content = content.replace(
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
        '/rasmlar/2026-10-02 17.58.46.jpg'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("testimonials/page.tsx updated with real school photos.")

def clean_students_page():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/app/students/page.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'const fallbackStudents:\s*StudentItem\[\]\s*=\s*\[[\s\S]*?\n\];',
        'const fallbackStudents: StudentItem[] = [];',
        content
    )
    content = content.replace(
        'const [students, setStudents] = useState<StudentItem[]>(fallbackStudents);',
        'const [students, setStudents] = useState<StudentItem[]>([]);'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("students/page.tsx cleaned successfully.")

def clean_certificates_page():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/app/certificates/page.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'const fallbackCertificates:\s*CertItem\[\]\s*=\s*\[[\s\S]*?\n\];',
        'const fallbackCertificates: CertItem[] = [];',
        content
    )
    content = content.replace(
        'const [certificates, setCertificates] = useState<CertItem[]>(fallbackCertificates);',
        'const [certificates, setCertificates] = useState<CertItem[]>([]);'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("certificates/page.tsx cleaned successfully.")

def clean_student_detail_page():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/app/students/[id]/page.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'const fallbackStudentsMap:\s*Record<string,\s*StudentItem>\s*=\s*\{[\s\S]*?\n\};',
        'const fallbackStudentsMap: Record<string, StudentItem> = {};',
        content
    )
    content = content.replace(
        'const [student, setStudent] = useState<StudentItem | null>(fallbackStudentsMap[studentId] || fallbackStudentsMap["stud-1"]);',
        'const [student, setStudent] = useState<StudentItem | null>(null);'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("students/[id]/page.tsx cleaned successfully.")

def clean_admin_teachers():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/app/admin/(dashboard)/teachers/page.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove auto-seed logic
    content = re.sub(
        r'if \(querySnapshot\.empty\) \{[\s\S]*?setTeachers\(seeded\);\s*\} else \{',
        'if (querySnapshot.empty) {\n        setTeachers([]);\n      } else {',
        content
    )
    content = re.sub(
        r'if \(snapshot\.empty\) \{[\s\S]*?setTeachers\(seeded\);\s*\} else \{',
        'if (snapshot.empty) {\n            setTeachers([]);\n          } else {',
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("admin teachers auto-seed removed.")

def clean_admin_stats():
    path = "/Users/jasur/Desktop/ziyo-zukko/wpdev-app/src/app/admin/(dashboard)/stats/page.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove auto-seed logic
    content = re.sub(
        r'if \(snapshot\.empty\) \{[\s\S]*?setStats\(seeded\);[\s\S]*?\} else \{',
        'if (snapshot.empty) {\n        setStats([]);\n      } else {',
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("admin stats auto-seed removed.")

if __name__ == "__main__":
    clean_team_section()
    clean_universities_section()
    clean_results_section()
    clean_testimonials()
    clean_testimonials_page()
    clean_students_page()
    clean_certificates_page()
    clean_student_detail_page()
    clean_admin_teachers()
    clean_admin_stats()
