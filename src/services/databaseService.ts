
// This service simulates database operations with local storage
// In a real app, this would connect to a backend API

interface DatabaseRecord {
  id: string | number;
  [key: string]: any;
}

// Initialize local storage with some default data
const initializeStorage = () => {
  // Only initialize if not already present
  if (!localStorage.getItem('db_profiles')) {
    localStorage.setItem('db_profiles', JSON.stringify([]));
  }
  if (!localStorage.getItem('db_documents')) {
    localStorage.setItem('db_documents', JSON.stringify([]));
  }
  if (!localStorage.getItem('db_requests')) {
    localStorage.setItem('db_requests', JSON.stringify([]));
  }
  if (!localStorage.getItem('db_teams')) {
    localStorage.setItem('db_teams', JSON.stringify([]));
  }
  if (!localStorage.getItem('db_timesheet')) {
    localStorage.setItem('db_timesheet', JSON.stringify([]));
  }
};

// Call initialization
initializeStorage();

// Generic CRUD operations
export const dbService = {
  getAll: (table: string): DatabaseRecord[] => {
    const data = localStorage.getItem(`db_${table}`);
    return data ? JSON.parse(data) : [];
  },
  
  getById: (table: string, id: string | number): DatabaseRecord | null => {
    const allRecords = dbService.getAll(table);
    return allRecords.find(record => record.id === id) || null;
  },
  
  create: (table: string, record: Omit<DatabaseRecord, 'id'>): DatabaseRecord => {
    const allRecords = dbService.getAll(table);
    const newRecord = {
      ...record,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`db_${table}`, JSON.stringify([...allRecords, newRecord]));
    return newRecord;
  },
  
  update: (table: string, id: string | number, updates: Partial<DatabaseRecord>): DatabaseRecord | null => {
    const allRecords = dbService.getAll(table);
    const index = allRecords.findIndex(record => record.id === id);
    
    if (index === -1) return null;
    
    const updatedRecord = {
      ...allRecords[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    allRecords[index] = updatedRecord;
    localStorage.setItem(`db_${table}`, JSON.stringify(allRecords));
    
    return updatedRecord;
  },
  
  delete: (table: string, id: string | number): boolean => {
    const allRecords = dbService.getAll(table);
    const filteredRecords = allRecords.filter(record => record.id !== id);
    
    if (filteredRecords.length === allRecords.length) return false;
    
    localStorage.setItem(`db_${table}`, JSON.stringify(filteredRecords));
    return true;
  }
};

// Hook up the current user profile to the database
export const setupUserProfile = () => {
  // Check if we already have a profile for the current user
  const profiles = dbService.getAll('profiles');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!currentUser.id) return;
  
  const existingProfile = profiles.find(p => p.userId === currentUser.id);
  
  if (!existingProfile) {
    // Create a default profile
    dbService.create('profiles', {
      userId: currentUser.id,
      name: "John Smith",
      email: currentUser.email || "john.smith@example.com",
      position: "Senior Software Engineer",
      department: "Engineering",
      phone: "+1 (555) 123-4567",
      address: "123 Tech Lane, San Francisco, CA 94107",
      hireDate: "2019-05-15",
      manager: "Jane Johnson",
      bio: "Experienced software engineer with expertise in frontend development and a passion for creating intuitive user interfaces.",
      socialSecurity: "XXX-XX-1234",
      bankAccount: "XXXX-XXXX-XXXX-5678",
      careerHistory: [
        {
          id: 1,
          company: "Current Company",
          position: "Senior Software Engineer",
          startDate: "May 2019",
          endDate: "Present",
          description: "Leading frontend development for the company's main product. Implemented new features and improved performance."
        },
        {
          id: 2,
          company: "Previous Tech",
          position: "Software Engineer",
          startDate: "January 2017",
          endDate: "April 2019",
          description: "Worked on multiple web applications using React and Node.js. Collaborated with cross-functional teams."
        },
        {
          id: 3,
          company: "StartUp Inc",
          position: "Junior Developer",
          startDate: "June 2015",
          endDate: "December 2016",
          description: "Started as an intern and grew into a full-time role. Focused on frontend development with JavaScript."
        }
      ],
      documents: [
        { id: 1, name: "Employment Contract", date: "2019-05-15", type: "PDF" },
        { id: 2, name: "Tax Information Form", date: "2023-01-10", type: "PDF" },
        { id: 3, name: "Performance Review 2022", date: "2022-12-05", type: "DOCX" },
        { id: 4, name: "Benefits Enrollment", date: "2023-01-15", type: "PDF" },
        { id: 5, name: "Training Certificate", date: "2022-08-22", type: "PDF" }
      ]
    });
  }
};
