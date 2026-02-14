export interface TeamMember {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
}

export const aboutUsTeamData: TeamMember[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    title: 'Co-Founder & Chief Clinical Officer',
    description:
      'Focuses on her vision for NeuraSleep, 15 years in clinical psychology and sleep research, and pioneering an evidence-based approach.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Co-Founder & CEO',
    description:
      'Mentions his personal struggles with sleep, co-founding NeuraSleep, and 12 years of healthcare innovation experience.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'Co-Founder & Head of Product',
    description:
      'Highlights her background in UX design and behavioral science, and ensuring Deep Rest Sessions are effective and relaxing.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Dr. James Williams',
    title: 'Founding Advisor & Sleep Medicine Expert',
    description:
      'Details his role as a medical advisor, ensuring clinical standards, and 20 years in sleep medicine and research.',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&auto=format&fit=crop',
  },
];
