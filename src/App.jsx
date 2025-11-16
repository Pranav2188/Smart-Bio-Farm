import React, { useState } from 'react';

// Function to get SVG for an icon name
const getIconSvg = (iconName, className) => {
  const icons = {
    Sprout: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M7 20h10"/><path d="M12 14V4"/><path d="M17 18c-1.4-2.5-2.7-4.2-5-6-2.3 1.8-3.6 3.5-5 6"/><path d="M12 14c1.4-2.5 2.7-4.2 5-6 2.3 1.8 3.6 3.5 5 6"/></svg>`,
    User: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    Users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    Building2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M6 22V7H4v15"/><path d="M18 22V7h-2v15"/><path d="M22 22V4H2v18"/><path d="M10 22V7h-2v15"/><path d="M12 12H8"/><path d="M12 18H8"/><path d="M12 6H8"/><path d="M16 12h-4"/><path d="M16 18h-4"/><path d="M16 6h-4"/></svg>`,
    ArrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    Mail: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.93 1.93 0 0 1-2.06 0L2 7"/></svg>`,
    Lock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    UserPlus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
    LogOut: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
    Thermometer: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>`,
    Droplets: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M7.64 10.35c-.66-.67-.9-1.2-1.37-1.65C4.35 6.93 2.5 5 2.5 3c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2"/><path d="M16.36 13.65c.66.67.9 1.2 1.37 1.65 2.29 2.13 4.14 4.04 4.14 6.05 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.1.9-2 2-2"/><path d="M12 21c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2"/><path d="M12 13c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2"/></svg>`,
    AlertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    CheckCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
    DollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    Package: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="m7.5 4.27-.5.25C6.18 5.16 5 6.13 5 7.5v3.17C5 12.1 4.1 13 3 13H2"/><path d="M22 13h-1c-1.1 0-2 .9-2 2v2.5c0 1.37-1.18 2.34-2 2.73l-.5.25"/><path d="M2 13v3.5c0 1.37 1.18 2.34 2 2.73l-.5.25"/><path d="M12 22V4"/><path d="M12 4.27L19.5 8l-7.5 3.73L4.5 8z"/><path d="M12 11.73L19.5 15.46l-7.5 3.74-7.5-3.74z"/></svg>`,
    TrendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    Plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
    Edit: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    Trash2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
    Save: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    X: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  };
  return { __html: icons[iconName] || '' };
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [newReport, setNewReport] = useState({ message: '', type: 'info' });

  // Live data simulation
  const [liveData] = useState({
    temperature: 28,
    humidity: 65
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Low soil moisture detected in Field A', time: '10 mins ago' },
    { id: 2, type: 'info', message: 'Weather forecast: Rain expected tomorrow', time: '1 hour ago' },
    { id: 3, type: 'alert', message: 'Pest activity reported in nearby farms', time: '2 hours ago' }
  ]);

  const [animalStats] = useState({
    totalAnimals: 245,
    activeCategories: 2,
    todayUpdates: 5,
    totalValue: 185000
  });

  const [pigData, setPigData] = useState([
    { id: 1, date: '2025-11-15', category: 'Boar', gender: 'Male', quantity: 15, price: 12000 },
    { id: 2, date: '2025-11-14', category: 'Sow', gender: 'Female', quantity: 20, price: 11000 }
  ]);

  const [chickenData, setChickenData] = useState([
    { id: 1, date: '2025-11-15', category: 'Broiler', gender: 'Mixed', quantity: 150, price: 180 },
    { id: 2, date: '2025-11-14', category: 'Layer', gender: 'Female', quantity: 100, price: 220 }
  ]);

  const [editingRow, setEditingRow] = useState(null);
  const [newEntry, setNewEntry] = useState({
    date: '',
    category: '',
    gender: '',
    quantity: '',
    price: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const professions = [
    {
      id: 'farmer',
      title: 'Farmer',
      icon: 'Sprout',
      description: 'Manage your farm, crops, and livestock efficiently',
      color: 'bg-green-500'
    },
    {
      id: 'veterinarian',
      title: 'Veterinarian',
      icon: 'Users',
      description: 'Provide healthcare services for livestock',
      color: 'bg-blue-500'
    },
    {
      id: 'government',
      title: 'Government Services',
      icon: 'Building2',
      description: 'Monitor and support agricultural development',
      color: 'bg-purple-500'
    }
  ];

  const handleProfessionSelect = (professionId) => {
    setSelectedProfession(professionId);
    setCurrentPage('login');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    setUserInfo({
      name: formData.name || 'John Farmer',
      email: formData.email,
      profession: selectedProfession
    });
    setCurrentPage('dashboard');
  };

  const handleSignup = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setUserInfo({
      name: formData.name,
      email: formData.email,
      profession: selectedProfession
    });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUserInfo(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setCurrentPage('welcome');
    setShowProfileMenu(false);
  };

  const handleAddReport = () => {
    if (!newReport.message.trim()) {
      alert('Please enter a message');
      return;
    }
    const report = {
      id: alerts.length + 1,
      type: newReport.type,
      message: newReport.message,
      time: 'Just now'
    };
    setAlerts([report, ...alerts]);
    setNewReport({ message: '', type: 'info' });
    setShowAddReportModal(false);
  };

  const handleAddEntry = () => {
    if (!newEntry.date || !newEntry.category || !newEntry.gender || !newEntry.quantity || !newEntry.price) {
      alert('Please fill all fields');
      return;
    }

    const entry = {
      id: selectedAnimal === 'pigs' ? pigData.length + 1 : chickenData.length + 1,
      ...newEntry,
      quantity: parseInt(newEntry.quantity),
      price: parseFloat(newEntry.price)
    };

    if (selectedAnimal === 'pigs') {
      setPigData([...pigData, entry]);
    } else {
      setChickenData([...chickenData, entry]);
    }

    setNewEntry({ date: '', category: '', gender: '', quantity: '', price: '' });
    setShowAddForm(false);
  };

  const handleDeleteEntry = (id) => {
    if (selectedAnimal === 'pigs') {
      setPigData(pigData.filter(item => item.id !== id));
    } else {
      setChickenData(chickenData.filter(item => item.id !== id));
    }
  };

  const handleEditEntry = (entry) => {
    setEditingRow(entry.id);
  };

  const handleSaveEdit = (id) => {
    setEditingRow(null);
  };

  const handleEntryChange = (id, field, value) => {
    if (selectedAnimal === 'pigs') {
      setPigData(pigData.map(item => 
        item.id === id ? { ...item, [field]: field === 'quantity' ? parseInt(value) : field === 'price' ? parseFloat(value) : value } : item
      ));
    } else {
      setChickenData(chickenData.map(item => 
        item.id === id ? { ...item, [field]: field === 'quantity' ? parseInt(value) : field === 'price' ? parseFloat(value) : value } : item
      ));
    }
  };

  // Welcome Page
  if (currentPage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8 flex justify-center">
            <div className="bg-green-600 p-6 rounded-full shadow-2xl">
              <span dangerouslySetInnerHTML={getIconSvg('Sprout', 'w-20 h-20 text-white')} />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Welcome to
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
            Smart Bio Farm
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Revolutionizing agriculture with smart technology and sustainable practices
          </p>
          <button
            onClick={() => setCurrentPage('profession')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            Get Started
            <span dangerouslySetInnerHTML={getIconSvg('ArrowRight', 'w-5 h-5')} />
          </button>
        </div>
      </div>
    );
  }

  // Profession Selection Page
  if (currentPage === 'profession') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 p-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Choose Your Profession
            </h2>
            <p className="text-lg text-gray-600">
              Select your role to access tailored features and services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {professions.map((profession) => {
              return (
                <div
                  key={profession.id}
                  onClick={() => handleProfessionSelect(profession.id)}
                  className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`${profession.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <span dangerouslySetInnerHTML={getIconSvg(profession.icon, 'w-8 h-8 text-white')} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                    {profession.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    {profession.description}
                  </p>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors">
                    Continue
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentPage('welcome')}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              ← Back to Welcome
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    const selectedProf = professions.find(p => p.id === selectedProfession);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className={`${selectedProf.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span dangerouslySetInnerHTML={getIconSvg('User', 'w-8 h-8 text-white')} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Login as {selectedProf.title}
            </h2>
            <p className="text-gray-600">
              Welcome back! Please login to your account
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <span dangerouslySetInnerHTML={getIconSvg('Mail', 'absolute left-3 top-3.5 w-5 h-5 text-gray-400')} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <span dangerouslySetInnerHTML={getIconSvg('Lock', 'absolute left-3 top-3.5 w-5 h-5 text-gray-400')} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button className="text-sm text-green-600 hover:text-green-700">
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage('profession')}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              ← Change Profession
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signup Page
  if (currentPage === 'signup') {
    const selectedProf = professions.find(p => p.id === selectedProfession);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className={`${selectedProf.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span dangerouslySetInnerHTML={getIconSvg('UserPlus', 'w-8 h-8 text-white')} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Sign Up as {selectedProf.title}
            </h2>
            <p className="text-gray-600">
              Create your account to get started
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name
              </label>
              <div className="relative">
                <span dangerouslySetInnerHTML={getIconSvg('User', 'absolute left-3 top-3.5 w-5 h-5 text-gray-400')} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John Farmer"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <span dangerouslySetInnerHTML={getIconSvg('Mail', 'absolute left-3 top-3.5 w-5 h-5 text-gray-400')} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <span dangerouslySetInnerHTML={getIconSvg('Lock', 'absolute left-3 top-3.5 w-5 h-5 text-gray-400')} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span dangerouslySetInnerHTML={getIconSvg('Lock', 'absolute left-3 top-3.5 w-5 h-5 text-gray-400')} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              onClick={handleSignup}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Sign Up
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Login
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage('profession')}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              ← Change Profession
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page
  if (currentPage === 'dashboard') {
    const selectedProf = professions.find(p => p.id === userInfo.profession);
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className={`${selectedProf.color} w-8 h-8 rounded-full flex items-center justify-center mr-3`}>
                  <span dangerouslySetInnerHTML={getIconSvg(selectedProf.icon, 'w-5 h-5 text-white')} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Smart Bio Farm</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <span dangerouslySetInnerHTML={getIconSvg('User', 'w-5 h-5')} />
                    <span>{userInfo.name}</span>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span dangerouslySetInnerHTML={getIconSvg('LogOut', 'w-4 h-4 mr-2')} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Live Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span dangerouslySetInnerHTML={getIconSvg('Thermometer', 'w-8 h-8 text-red-500 mr-3')} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-gray-900">{liveData.temperature}°C</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span dangerouslySetInnerHTML={getIconSvg('Droplets', 'w-8 h-8 text-blue-500 mr-3')} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Humidity</p>
                  <p className="text-2xl font-bold text-gray-900">{liveData.humidity}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span dangerouslySetInnerHTML={getIconSvg('Package', 'w-8 h-8 text-green-500 mr-3')} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Animals</p>
                  <p className="text-2xl font-bold text-gray-900">{animalStats.totalAnimals}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <span dangerouslySetInnerHTML={getIconSvg('DollarSign', 'w-8 h-8 text-yellow-500 mr-3')} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${animalStats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
                <button
                  onClick={() => setShowAddReportModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                >
                  <span dangerouslySetInnerHTML={getIconSvg('Plus', 'w-4 h-4 mr-2')} />
                  Add Report
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <span dangerouslySetInnerHTML={getIconSvg(
                      alert.type === 'warning' ? 'AlertTriangle' : alert.type === 'alert' ? 'AlertTriangle' : 'CheckCircle',
                      `w-5 h-5 ${alert.type === 'warning' ? 'text-yellow-500' : alert.type === 'alert' ? 'text-red-500' : 'text-green-500'} mt-0.5`
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Animal Management Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Animal Management</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedAnimal('pigs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedAnimal === 'pigs' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Pigs
                  </button>
                  <button
                    onClick={() => setSelectedAnimal('chickens')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedAnimal === 'chickens' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Chickens
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {selectedAnimal && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-900">
                      {selectedAnimal === 'pigs' ? 'Pig' : 'Chicken'} Records
                    </h3>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                    >
                      <span dangerouslySetInnerHTML={getIconSvg('Plus', 'w-4 h-4 mr-2')} />
                      Add Entry
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(selectedAnimal === 'pigs' ? pigData : chickenData).map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingRow === item.id ? (
                                <input
                                  type="date"
                                  value={item.date}
                                  onChange={(e) => handleEntryChange(item.id, 'date', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              ) : (
                                item.date
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingRow === item.id ? (
                                <input
                                  type="text"
                                  value={item.category}
                                  onChange={(e) => handleEntryChange(item.id, 'category', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              ) : (
                                item.category
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingRow === item.id ? (
                                <select
                                  value={item.gender}
                                  onChange={(e) => handleEntryChange(item.id, 'gender', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Mixed">Mixed</option>
                                </select>
                              ) : (
                                item.gender
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingRow === item.id ? (
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleEntryChange(item.id, 'quantity', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              ) : (
                                item.quantity
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingRow === item.id ? (
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleEntryChange(item.id, 'price', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              ) : (
                                `$${item.price}`
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {editingRow === item.id ? (
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="text-green-600 hover:text-green-900 mr-2"
                                >
                                  <span dangerouslySetInnerHTML={getIconSvg('Save', 'w-4 h-4')} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEditEntry(item)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  <span dangerouslySetInnerHTML={getIconSvg('Edit', 'w-4 h-4')} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteEntry(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <span dangerouslySetInnerHTML={getIconSvg('Trash2', 'w-4 h-4')} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Report Modal */}
        {showAddReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Report</h3>
                <button
                  onClick={() => setShowAddReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span dangerouslySetInnerHTML={getIconSvg('X', 'w-6 h-6')} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={newReport.message}
                    onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Enter your report message..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddReportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReport}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    Add Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New {selectedAnimal === 'pigs' ? 'Pig' : 'Chicken'} Entry</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span dangerouslySetInnerHTML={getIconSvg('X', 'w-6 h-6')} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={selectedAnimal === 'pigs' ? 'Boar, Sow, etc.' : 'Broiler, Layer, etc.'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={newEntry.gender}
                    onChange={(e) => setNewEntry({ ...newEntry, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newEntry.quantity}
                    onChange={(e) => setNewEntry({ ...newEntry, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per unit</label>
                  <input
                    type="number"
                    value={newEntry.price}
                    onChange={(e) => setNewEntry({ ...newEntry, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter price"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}