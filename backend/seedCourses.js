const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const courses = [
  // Accounting Courses
  {
    title: "CERTIFICATE IN ACCOUNTS TRAINING (CAT \"SMART\")",
    code: "CAT_SMART",
    category: "Accounting",
    shortDescription: "Advanced accounts training with smart features",
    description: "Comprehensive accounting training program covering financial accounting, cost accounting, taxation, and advanced accounting concepts. This course includes practical training on accounting software and real-world case studies.",
    duration: 6,
    fees: 15000,
    level: "Intermediate",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=CAT+SMART",
    syllabus: [
      {
        module: "Financial Accounting",
        topics: ["Accounting Principles", "Journal Entries", "Ledger Preparation", "Trial Balance", "Final Accounts"]
      },
      {
        module: "Cost Accounting",
        topics: ["Cost Concepts", "Material Costing", "Labor Costing", "Overhead Costs", "Job Costing"]
      },
      {
        module: "Taxation",
        topics: ["GST", "Income Tax", "TDS", "Tax Planning", "Tax Returns"]
      }
    ],
    prerequisites: ["Basic Accounting Knowledge", "Mathematics"],
    outcomes: ["Become a certified accountant", "Handle company accounts independently", "Tax filing expertise"]
  },
  {
    title: "CERTIFICATE IN ACCOUNTS TRAINING (CAT)",
    code: "CAT",
    category: "Accounting",
    shortDescription: "Professional accounts training certification",
    description: "Fundamental to advanced accounting training covering all essential aspects of modern accounting practices including manual and computerized accounting.",
    duration: 4,
    fees: 12000,
    level: "Beginner",
    status: "Active",
    image: "https://picsum.photos/seed/CAT_SMART/400/300.jpg",
    syllabus: [
      {
        module: "Basic Accounting",
        topics: ["Accounting Basics", "Double Entry System", "Financial Statements"]
      },
      {
        module: "Computer Accounting",
        topics: ["Tally ERP 9", "Busy Software", "Excel for Accounting"]
      }
    ],
    prerequisites: ["Basic Mathematics"],
    outcomes: ["Entry-level accounting jobs", "Tally certification", "Basic accounting knowledge"]
  },
  {
    title: "FINANCIAL EDUCATION OF MANAGEMENT (FEM)",
    code: "FEM",
    category: "Accounting",
    shortDescription: "Financial management education program",
    description: "Specialized course focusing on financial education for managers, covering financial planning, investment analysis, and corporate finance.",
    duration: 3,
    fees: 10000,
    level: "Intermediate",
    status: "Active",
    image: "https://picsum.photos/seed/FEM/400/300.jpg",
    syllabus: [
      {
        module: "Financial Planning",
        topics: ["Budgeting", "Financial Analysis", "Investment Planning"]
      },
      {
        module: "Corporate Finance",
        topics: ["Capital Structure", "Working Capital", "Financial Ratios"]
      }
    ],
    prerequisites: ["Basic Accounting", "Business Knowledge"],
    outcomes: ["Financial management skills", "Investment knowledge", "Corporate finance expertise"]
  },
  {
    title: "TALLY ERP.9",
    code: "TALLY_ERP9",
    category: "Accounting",
    shortDescription: "Complete Tally ERP 9 training",
    description: "Comprehensive Tally ERP 9 training covering all modules including GST, taxation, inventory management, and payroll.",
    duration: 2,
    fees: 8000,
    level: "Beginner",
    status: "Active",
    image: "https://picsum.photos/seed/TALLY_ERP9/400/300.jpg",
    syllabus: [
      {
        module: "Tally Basics",
        topics: ["Company Creation", "Ledger Management", "Voucher Entry"]
      },
      {
        module: "Advanced Tally",
        topics: ["GST in Tally", "Taxation", "Payroll", "Manufacturing"]
      }
    ],
    prerequisites: ["Basic Computer Knowledge", "Basic Accounting"],
    outcomes: ["Tally certification", "Accounting job readiness", "GST expertise"]
  },

  // Designing Courses
  {
    title: "CERTIFICATE IN TEXTILE DESGINING (C.T.D)",
    code: "CTD",
    category: "Designing",
    shortDescription: "Professional textile designing course",
    description: "Complete textile designing program covering traditional and modern textile design techniques, pattern making, and CAD software.",
    duration: 6,
    fees: 18000,
    level: "Intermediate",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=CTD",
    syllabus: [
      {
        module: "Textile Basics",
        topics: ["Fiber Science", "Yarn Technology", "Fabric Structure"]
      },
      {
        module: "Design Principles",
        topics: ["Color Theory", "Pattern Design", "Textile CAD"]
      }
    ],
    prerequisites: ["Drawing Skills", "Creativity"],
    outcomes: ["Textile designer", "Pattern maker", "CAD operator"]
  },
  {
    title: "CERTIFICATE IN DIGITAL PRINT (C.D.P)",
    code: "CDP",
    category: "Designing",
    shortDescription: "Digital printing technology course",
    description: "Advanced digital printing course covering modern printing technologies, color management, and print production workflows.",
    duration: 4,
    fees: 14000,
    level: "Intermediate",
    status: "Active",
    image: "https://via.placeholder.com/400x300/EF4444/FFFFFF?text=CDP",
    syllabus: [
      {
        module: "Digital Printing Basics",
        topics: ["Printing Technology", "Color Management", "File Preparation"]
      },
      {
        module: "Advanced Printing",
        topics: ["Large Format Printing", "Textile Printing", "3D Printing"]
      }
    ],
    prerequisites: ["Computer Knowledge", "Design Basics"],
    outcomes: ["Print technician", "Color management expert", "Production supervisor"]
  },
  {
    title: "DESKTOP PUBLISHING & MODELING (D.T.P)",
    code: "DTP",
    category: "Designing",
    shortDescription: "Desktop publishing and modeling",
    description: "Comprehensive desktop publishing course covering page layout, graphic design, and 3D modeling basics.",
    duration: 3,
    fees: 12000,
    level: "Beginner",
    status: "Active",
    image: "https://via.placeholder.com/400x300/06B6D4/FFFFFF?text=DTP",
    syllabus: [
      {
        module: "Desktop Publishing",
        topics: ["Page Layout", "Typography", "Image Editing"]
      },
      {
        module: "Modeling Basics",
        topics: ["3D Modeling", "Rendering", "Animation Basics"]
      }
    ],
    prerequisites: ["Basic Computer Skills"],
    outcomes: ["DTP operator", "Layout designer", "3D modeler"]
  },
  {
    title: "TEXTILE DESIGNING (T.D.)",
    code: "TD",
    category: "Designing",
    shortDescription: "Textile design specialization",
    description: "Focused textile designing course emphasizing creative design development and technical textile knowledge.",
    duration: 5,
    fees: 16000,
    level: "Intermediate",
    status: "Active",
    image: "https://via.placeholder.com/400x300/84CC16/FFFFFF?text=TD",
    syllabus: [
      {
        module: "Design Development",
        topics: ["Sketching", "Color Theory", "Pattern Creation"]
      },
      {
        module: "Technical Textiles",
        topics: ["Fabric Technology", "Print Techniques", "Quality Control"]
      }
    ],
    prerequisites: ["Art Background", "Design Interest"],
    outcomes: ["Textile designer", "Fashion consultant", "Quality controller"]
  },
  {
    title: "CERTIFICATE IN DIGITAL MARKETING (C.D.M)",
    code: "CDM",
    category: "Designing",
    shortDescription: "Digital marketing certification",
    description: "Complete digital marketing course covering SEO, social media marketing, content marketing, and analytics.",
    duration: 3,
    fees: 15000,
    level: "Beginner",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/F97316/FFFFFF?text=CDM",
    syllabus: [
      {
        module: "Digital Marketing Basics",
        topics: ["Marketing Fundamentals", "Consumer Behavior", "Market Research"]
      },
      {
        module: "Digital Channels",
        topics: ["SEO/SEM", "Social Media", "Email Marketing", "Content Marketing"]
      }
    ],
    prerequisites: ["Basic Computer Knowledge", "Internet Usage"],
    outcomes: ["Digital marketer", "SEO specialist", "Social media manager"]
  },

  // 10+2/ College Students Courses
  {
    title: "DIPLOMA IN TEXTILE DESIGNING & ACCOUNTING (D.T.D.A.)",
    code: "DTDA",
    category: "10+2/ College Students",
    shortDescription: "Combined textile and accounting diploma",
    description: "Unique diploma program combining textile designing with accounting skills, perfect for students looking for diverse career options.",
    duration: 12,
    fees: 25000,
    level: "Intermediate",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=DTDA",
    syllabus: [
      {
        module: "Textile Designing",
        topics: ["Design Principles", "CAD Software", "Pattern Making"]
      },
      {
        module: "Accounting",
        topics: ["Financial Accounting", "Cost Accounting", "Taxation"]
      }
    ],
    prerequisites: ["10+2 Pass", "Basic Mathematics"],
    outcomes: ["Dual career options", "Business management", "Entrepreneurship"]
  },
  {
    title: "CERTIFICATE IN ADVANCE BASIC & TALLY (C.A.B.T.)",
    code: "CABT",
    category: "10+2/ College Students",
    shortDescription: "Advanced basic computer and Tally",
    description: "Perfect course for college students covering advanced computer basics and professional Tally training.",
    duration: 4,
    fees: 10000,
    level: "Beginner",
    status: "Active",
    image: "https://via.placeholder.com/400x300/6366F1/FFFFFF?text=CABT",
    syllabus: [
      {
        module: "Computer Basics",
        topics: ["MS Office", "Internet", "Email", "File Management"]
      },
      {
        module: "Tally Training",
        topics: ["Accounting in Tally", "GST", "Taxation", "Reports"]
      }
    ],
    prerequisites: ["10+2 Pass"],
    outcomes: ["Computer proficiency", "Accounting jobs", "Office administration"]
  },

  // IT For Beginners Courses
  {
    title: "MY COMPUTER (M.C)",
    code: "MC",
    category: "IT For Beginners",
    shortDescription: "Basic computer course for beginners",
    description: "Fundamental computer course designed for absolute beginners covering basic computer operations, internet usage, and essential software.",
    duration: 1,
    fees: 3000,
    level: "Beginner",
    status: "Active",
    image: "https://via.placeholder.com/400x300/14B8A6/FFFFFF?text=MC",
    syllabus: [
      {
        module: "Computer Basics",
        topics: ["Hardware Overview", "Windows OS", "File Management", "Basic Troubleshooting"]
      },
      {
        module: "Internet & Email",
        topics: ["Internet Browsing", "Email Usage", "Online Safety", "Social Media Basics"]
      }
    ],
    prerequisites: ["None"],
    outcomes: ["Computer literacy", "Internet confidence", "Basic digital skills"]
  },
  {
    title: "CERTIFICATE IN COMPUTER APPLICATION (C.C.A.)",
    code: "CCA",
    category: "IT For Beginners",
    shortDescription: "Computer applications certification",
    description: "Comprehensive computer applications course covering office software, internet applications, and basic programming concepts.",
    duration: 3,
    fees: 8000,
    level: "Beginner",
    status: "Active",
    image: "https://via.placeholder.com/400x300/A855F7/FFFFFF?text=CCA",
    syllabus: [
      {
        module: "Office Applications",
        topics: ["MS Word", "MS Excel", "MS PowerPoint", "MS Access"]
      },
      {
        module: "Internet Applications",
        topics: ["Web Browsing", "Email Clients", "Online Tools", "Cloud Storage"]
      }
    ],
    prerequisites: ["Basic Computer Knowledge"],
    outcomes: ["Office jobs", "Computer operator", "Data entry specialist"]
  },
  {
    title: "KIDS PROGRAMM (K.P.)",
    code: "KP",
    category: "IT For Beginners",
    shortDescription: "Computer programming for kids",
    description: "Fun and interactive programming course designed specifically for children to introduce them to coding concepts.",
    duration: 2,
    fees: 5000,
    level: "Beginner",
    status: "Active",
    image: "https://via.placeholder.com/400x300/0EA5E9/FFFFFF?text=KP",
    syllabus: [
      {
        module: "Programming Basics",
        topics: ["Logic Building", "Problem Solving", "Simple Algorithms"]
      },
      {
        module: "Visual Programming",
        topics: ["Scratch", "Blockly", "Simple Games", "Animations"]
      }
    ],
    prerequisites: ["Age 8-14", "Basic Computer Interest"],
    outcomes: ["Logical thinking", "Problem solving", "Coding foundation"]
  },
  {
    title: "CERTIFICATE IN APPLICATION SOFTWARE (C.A.S.)",
    code: "CAS",
    category: "IT For Beginners",
    shortDescription: "Application software training",
    description: "Practical course on various application software used in offices and businesses for daily operations.",
    duration: 2,
    fees: 6000,
    level: "Beginner",
    status: "Active",
    image: "https://via.placeholder.com/400x300/22C55E/FFFFFF?text=CAS",
    syllabus: [
      {
        module: "Productivity Software",
        topics: ["MS Office Suite", "Google Workspace", "PDF Tools"]
      },
      {
        module: "Business Applications",
        topics: ["Accounting Software", "CRM Tools", "Project Management"]
      }
    ],
    prerequisites: ["Basic Computer Skills"],
    outcomes: ["Software proficiency", "Office productivity", "Business tools expertise"]
  },
  {
    title: "BACHELOR OF COMPUTER CONCEPT (B.C.C)",
    code: "BCC",
    category: "IT For Beginners",
    shortDescription: "Bachelor level computer concepts",
    description: "Comprehensive computer concepts course covering theoretical and practical aspects of computing and information technology.",
    duration: 6,
    fees: 12000,
    level: "Intermediate",
    status: "Active",
    image: "https://via.placeholder.com/400x300/D946EF/FFFFFF?text=BCC",
    syllabus: [
      {
        module: "Computer Theory",
        topics: ["Computer Architecture", "Operating Systems", "Networks", "Security"]
      },
      {
        module: "Practical Computing",
        topics: ["Programming Basics", "Web Development", "Database Concepts"]
      }
    ],
    prerequisites: ["10+2 Pass", "Basic Computer Knowledge"],
    outcomes: ["IT foundation", "Programming basics", "Higher education readiness"]
  },

  // Diploma Courses
  {
    title: "ADVANCE DIPLOMA IN COMPUTER APPLICATION (A.D.C.A)",
    code: "ADCA",
    category: "Diploma",
    shortDescription: "Advanced computer applications diploma",
    description: "Comprehensive diploma program covering advanced computer applications, programming, and software development.",
    duration: 12,
    fees: 30000,
    level: "Advanced",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/DC2626/FFFFFF?text=ADCA",
    syllabus: [
      {
        module: "Advanced Programming",
        topics: ["C++", "Java", "Python", "Data Structures"]
      },
      {
        module: "Web Development",
        topics: ["HTML/CSS", "JavaScript", "React", "Node.js"]
      },
      {
        module: "Database Management",
        topics: ["SQL", "MongoDB", "Database Design"]
      }
    ],
    prerequisites: ["10+2 Pass", "Basic Programming Knowledge"],
    outcomes: ["Software developer", "Web developer", "Database administrator"]
  },

  // Global IT Certifications Courses
  {
    title: "CERTIFICATE IN ADVANCE WEB DESIGNING (C.A.W.D)",
    code: "CAWD",
    category: "Global IT Certifications",
    shortDescription: "Advanced web designing certification",
    description: "Professional web designing course covering modern web technologies, responsive design, and user experience.",
    duration: 6,
    fees: 20000,
    level: "Intermediate",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=CAWD",
    syllabus: [
      {
        module: "Frontend Development",
        topics: ["HTML5/CSS3", "JavaScript", "React", "Vue.js"]
      },
      {
        module: "Backend Development",
        topics: ["Node.js", "PHP", "Database Integration"]
      },
      {
        module: "Design Principles",
        topics: ["UI/UX Design", "Responsive Design", "Graphic Design"]
      }
    ],
    prerequisites: ["Basic Computer Knowledge", "Design Interest"],
    outcomes: ["Web designer", "Frontend developer", "UI/UX designer"]
  },
  {
    title: "DIPLOMA IN SOFTWARE MANAGEMENT (DSM)",
    code: "DSM",
    category: "Global IT Certifications",
    shortDescription: "Software management diploma",
    description: "Advanced software management course covering software development lifecycle, project management, and quality assurance.",
    duration: 8,
    fees: 25000,
    level: "Advanced",
    status: "Active",
    image: "https://via.placeholder.com/400x300/059669/FFFFFF?text=DSM",
    syllabus: [
      {
        module: "Software Development",
        topics: ["SDLC", "Agile Methodology", "Version Control"]
      },
      {
        module: "Project Management",
        topics: ["Planning", "Execution", "Risk Management", "Quality Assurance"]
      }
    ],
    prerequisites: ["Programming Knowledge", "Computer Background"],
    outcomes: ["Project manager", "Software architect", "QA manager"]
  },
  {
    title: "CERTIFICATE IN ADVANCE SOFTWARE DEVELOPMENT (C.A.S.D)",
    code: "CASD",
    category: "Global IT Certifications",
    shortDescription: "Advanced software development",
    description: "Intensive software development course covering advanced programming concepts, software architecture, and development best practices.",
    duration: 10,
    fees: 28000,
    level: "Advanced",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/0891B2/FFFFFF?text=CASD",
    syllabus: [
      {
        module: "Advanced Programming",
        topics: ["Algorithms", "Data Structures", "Design Patterns"]
      },
      {
        module: "Software Architecture",
        topics: ["System Design", "Microservices", "Cloud Computing"]
      }
    ],
    prerequisites: ["Programming Experience", "Computer Science Background"],
    outcomes: ["Software engineer", "System architect", "Tech lead"]
  },
  {
    title: "SMART (P.G.D.C.A.)",
    code: "PGDCA",
    category: "Global IT Certifications",
    shortDescription: "Post Graduate Diploma in Computer Applications",
    description: "Comprehensive post-graduate diploma covering advanced computer applications, software engineering, and IT management.",
    duration: 12,
    fees: 35000,
    level: "Advanced",
    status: "Featured",
    image: "https://via.placeholder.com/400x300/BE123C/FFFFFF?text=PGDCA",
    syllabus: [
      {
        module: "Advanced Computing",
        topics: ["Advanced Programming", "Software Engineering", "System Analysis"]
      },
      {
        module: "IT Management",
        topics: ["IT Strategy", "Project Management", "Business Intelligence"]
      }
    ],
    prerequisites: ["Graduation", "Computer Background"],
    outcomes: ["IT manager", "Systems analyst", "Software architect"]
  }
];

async function seedCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert new courses
    const insertedCourses = await Course.insertMany(courses);
    console.log(`Inserted ${insertedCourses.length} courses`);

    console.log('Course seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
