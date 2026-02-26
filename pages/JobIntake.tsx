
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Users, Upload, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../types';

const JobIntake: React.FC = () => {
  const { createPhotographyWorkflow, users } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientName: '',
    leagueName: '',
    sportType: 'Soccer',
    season: 'Spring',
    location: '',
    playerCount: '',
    pictureDate: '',
    packageType: 'Standard League ($10/player)',
    requests: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    invoiceNeeded: 'No',
    secondaryAssignee: ''
  });
  const [fileAttached, setFileAttached] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.leagueName,
      client: formData.contactName, // The POC is the client contact
      status: ProjectStatus.NEW_PROJECT,
      budget: Number(formData.playerCount) * (formData.packageType.includes('$10') ? 10 : 15), // Est value
      deadline: formData.pictureDate,
      description: `${formData.season} ${formData.sportType} League at ${formData.location}. ${formData.requests}`,
      progress: 0,
      sportType: formData.sportType,
      season: formData.season as any,
      location: formData.location,
      playerCount: Number(formData.playerCount),
      packageType: formData.packageType,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      rosterFile: fileAttached || undefined
    };

    createPhotographyWorkflow(newProject, formData.secondaryAssignee);
    setStep(2); // Success step
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileAttached(e.target.files[0].name);
    }
  };

  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Job Created Successfully!</h2>
        <p className="text-slate-500 max-w-md mb-8">
          The project has been added to the board. 
          Tasks for Pre-Production, Picture Day, and Editing have been auto-generated and assigned.
          A welcome email has been sent to the client.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/projects')} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-700">
            View Project Board
          </button>
          <button onClick={() => { setStep(1); setFormData({ ...formData, leagueName: '' }); }} className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-50">
            Add Another Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">New Job Intake</h1>
        <p className="text-slate-500 dark:text-slate-400">Enter league details to auto-generate the project workflow.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        {/* Section 1: Job Details */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center">
          <Users className="w-5 h-5 mr-2 text-brand-600" /> Client & League Info
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">League / Client Name</label>
            <input required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
              value={formData.leagueName} onChange={e => setFormData({...formData, leagueName: e.target.value})} placeholder="e.g. Westside Soccer League"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sport Type</label>
            <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.sportType} onChange={e => setFormData({...formData, sportType: e.target.value})}
            >
              <option value="Soccer">Soccer</option>
              <option value="Baseball">Baseball</option>
              <option value="Basketball">Basketball</option>
              <option value="Football">Football</option>
              <option value="Dance">Dance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Season</label>
            <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})}
            >
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <input required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Central Park Fields"
            />
          </div>
        </div>

        {/* Section 2: Logistics */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-brand-600" /> Logistics & Package
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Picture Day Date</label>
            <input required type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.pictureDate} onChange={e => setFormData({...formData, pictureDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Est. Player Count</label>
            <input required type="number" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.playerCount} onChange={e => setFormData({...formData, playerCount: e.target.value})} placeholder="300"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Package Type</label>
            <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.packageType} onChange={e => setFormData({...formData, packageType: e.target.value})}
            >
              <option value="Standard League ($10/player)">Standard League ($10/player)</option>
              <option value="Premium Package">Premium Package</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Team Roster Upload</label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 transition-colors text-center cursor-pointer">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
              <div className="flex flex-col items-center justify-center py-2">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-sm text-slate-500">{fileAttached || "Click to upload CSV/Photo"}</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Special Requests</label>
            <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" rows={2}
              value={formData.requests} onChange={e => setFormData({...formData, requests: e.target.value})} placeholder="Notes about background, timing, etc."
            />
          </div>
        </div>

        {/* Section 3: Contact & Assignment */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-brand-600" /> Point of Contact & Assignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">POC Name</label>
            <input required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input required type="email" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
            <input required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Send Invoice Now?</label>
            <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.invoiceNeeded} onChange={e => setFormData({...formData, invoiceNeeded: e.target.value})}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Additional Team Member</label>
            <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              value={formData.secondaryAssignee} onChange={e => setFormData({...formData, secondaryAssignee: e.target.value})}
            >
              <option value="">Select Team Member</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 dark:border-slate-700 pt-6">
          <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
            Submit Job & Start Workflow
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobIntake;
