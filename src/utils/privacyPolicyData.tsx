import React from 'react';
import { 
  FaHandsHelping, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaEnvelope, 
  FaChartLine, 
  FaGavel,
  FaLock,
  FaUserShield,
  FaClipboardCheck,
  FaDatabase,
  FaCookie,
  FaChartBar,
  FaCog,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaBan,
  FaPauseCircle,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';

export interface TOCItem {
    id: string;
    number: string;
    title: string;
}

export interface ListItem {
    label: string;
    text: string;
}

export interface GridItem {
    icon: React.ReactNode;
    title: string;
    text: string;
}

export interface Subsection {
    title: string;
    paragraph?: string;
    listItems?: ListItem[];
    cookieCards?: GridItem[];
}

export interface SectionContent {
    paragraphs?: string[];
    subsections?: Subsection[];
    gridItems?: GridItem[];
    securityCards?: GridItem[];
    cookieCards?: GridItem[];
    rightsCards?: GridItem[];
    contactItems?: {
        icon: React.ReactNode;
        label: string;
        text: string;
        href?: string;
    }[];
}

export interface PrivacySection {
    id: string;
    number: string;
    title: string;
    content: SectionContent;
}

export const tocItems: TOCItem[] = [
  { id: 'introduction', number: '01', title: 'Introduction' },
  { id: 'information-collect', number: '02', title: 'Information We Collect' },
  { id: 'how-we-use', number: '03', title: 'How We Use Your Data' },
  { id: 'data-protection', number: '04', title: 'Data Protection' },
  { id: 'cookies', number: '05', title: 'Cookies & Tracking' },
  { id: 'privacy-rights', number: '06', title: 'Your Privacy Rights' },
  { id: 'contact', number: '07', title: 'Contact Us' },
];

export const privacySections: PrivacySection[] = [
  {
    id: 'introduction',
    number: '01',
    title: 'Introduction',
    content: {
      paragraphs: [
        'At Nervaya, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our services, including our website, mobile applications, and therapy services.',
        'By using our services, you agree to the collection and use of information in accordance with this policy. We encourage you to read this Privacy Policy carefully to understand our practices regarding your personal information and how we will treat it.',
      ],
    },
  },
  {
    id: 'information-collect',
    number: '02',
    title: 'Information We Collect',
    content: {
      subsections: [
        {
          title: 'Personal Information',
          paragraph: 'When you use our services, we may collect the following types of personal information:',
          listItems: [
            { label: 'Name and Contact Information:', text: 'Your full name, email address, phone number, and mailing address' },
            { label: 'Demographic Information:', text: 'Age, gender, and other demographic details you choose to provide' },
            { label: 'Health Information:', text: 'Information related to your mental health, sleep patterns, and wellness goals that you share with us' },
            { label: 'Payment Information:', text: 'Credit card details, billing address, and payment history (processed securely through third-party payment processors)' },
            { label: 'Appointment History:', text: 'Records of therapy sessions, consultations, and service usage' },
          ],
        },
        {
          title: 'Automatically Collected Information',
          paragraph: 'We automatically collect certain information when you visit our website or use our services:',
          listItems: [
            { label: 'IP Address:', text: 'Your Internet Protocol address and general location information' },
            { label: 'Browser Type:', text: 'Information about your web browser and device type' },
            { label: 'Device Information:', text: 'Device identifiers, operating system, and mobile network information' },
            { label: 'Usage Data:', text: 'Pages visited, time spent on pages, links clicked, and other interaction data' },
            { label: 'Cookies and Tracking Technologies:', text: 'Data collected through cookies, web beacons, and similar technologies' },
          ],
        },
      ],
    },
  },
  {
    id: 'how-we-use',
    number: '03',
    title: 'How We Use Your Data',
    content: {
      paragraphs: [
        'We use the information we collect for the following purposes:',
      ],
      gridItems: [
        {
          icon: <FaHandsHelping />,
          title: 'Service Provision',
          text: 'To provide, maintain, and improve our therapy and wellness services',
        },
        {
          icon: <FaCalendarAlt />,
          title: 'Appointment Scheduling',
          text: 'To schedule and manage therapy sessions and consultations',
        },
        {
          icon: <FaCreditCard />,
          title: 'Payment Processing',
          text: 'To process payments, manage billing, and send payment confirmations',
        },
        {
          icon: <FaEnvelope />,
          title: 'Communication',
          text: 'To send you updates, reminders, and respond to your inquiries',
        },
        {
          icon: <FaChartLine />,
          title: 'Analytics & Improvement',
          text: 'To analyze usage patterns and improve our services and user experience',
        },
        {
          icon: <FaGavel />,
          title: 'Legal Compliance',
          text: 'To comply with legal obligations and protect our rights and interests',
        },
      ],
    },
  },
  {
    id: 'data-protection',
    number: '04',
    title: 'Data Protection & Security',
    content: {
      paragraphs: [
        'We implement industry-standard security measures to protect your personal information:',
        'While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to using commercially reasonable means to protect your data.',
      ],
      securityCards: [
        {
          icon: <FaLock />,
          title: 'Encryption',
          text: 'All data transmitted between your device and our servers is encrypted using SSL/TLS technology to ensure secure communication.',
        },
        {
          icon: <FaUserShield />,
          title: 'Access Control',
          text: 'We restrict access to your personal information to authorized employees and service providers who need it to perform their duties.',
        },
        {
          icon: <FaClipboardCheck />,
          title: 'Regular Audits',
          text: 'We conduct regular security audits and assessments to identify and address potential vulnerabilities in our systems.',
        },
        {
          icon: <FaDatabase />,
          title: 'Secure Storage',
          text: 'Your data is stored on secure servers with multiple layers of protection, including firewalls and intrusion detection systems.',
        },
      ],
    },
  },
  {
    id: 'cookies',
    number: '05',
    title: 'Cookies & Tracking Technologies',
    content: {
      paragraphs: [
        'We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. Cookies are small text files stored on your device when you visit our website.',
        'You can control and manage cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our website.',
      ],
      subsections: [
        {
          title: 'Types of Cookies We Use',
          cookieCards: [
            {
              icon: <FaCookie />,
              title: 'Essential Cookies',
              text: 'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
            },
            {
              icon: <FaChartBar />,
              title: 'Analytics Cookies',
              text: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
            },
            {
              icon: <FaCog />,
              title: 'Preference Cookies',
              text: 'These cookies remember your preferences and settings to provide a more personalized experience on future visits.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'privacy-rights',
    number: '06',
    title: 'Your Privacy Rights',
    content: {
      paragraphs: [
        'Depending on your location, you may have the following rights regarding your personal information:',
        'To exercise any of these rights, please contact us at privacy@example.com. We will respond to your request within 30 days.',
      ],
      rightsCards: [
        {
          icon: <FaEye />,
          title: 'Access',
          text: 'You have the right to request access to the personal information we hold about you and receive a copy of that information.',
        },
        {
          icon: <FaEdit />,
          title: 'Correction',
          text: 'You can request that we correct any inaccurate or incomplete personal information we have about you.',
        },
        {
          icon: <FaTrash />,
          title: 'Deletion',
          text: 'You may request that we delete your personal information, subject to certain legal and operational requirements.',
        },
        {
          icon: <FaDownload />,
          title: 'Portability',
          text: 'You have the right to receive your personal information in a structured, commonly used format and transmit it to another service provider.',
        },
        {
          icon: <FaBan />,
          title: 'Objection',
          text: 'You can object to the processing of your personal information for certain purposes, such as direct marketing.',
        },
        {
          icon: <FaPauseCircle />,
          title: 'Restriction',
          text: 'You may request that we restrict the processing of your personal information under certain circumstances.',
        },
      ],
    },
  },
  {
    id: 'contact',
    number: '07',
    title: 'Contact Us',
    content: {
      paragraphs: [
        'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      ],
      contactItems: [
        {
          icon: <FaEnvelope />,
          label: 'Email',
          text: 'privacy@example.com',
          href: 'mailto:privacy@example.com',
        },
        {
          icon: <FaPhone />,
          label: 'Phone',
          text: '+1 (555) 123-4567',
          href: 'tel:+15551234567',
        },
        {
          icon: <FaMapMarkerAlt />,
          label: 'Address',
          text: '123 Wellness Street, Suite 100, City, State 12345',
        },
      ],
    },
  },
];
