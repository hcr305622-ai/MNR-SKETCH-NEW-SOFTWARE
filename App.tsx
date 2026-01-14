import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Search, Edit2, Trash2, LogOut, CheckCircle, Clock, 
  DollarSign, Users, Package, Settings, ChevronDown, ChevronRight 
} from 'lucide-react';
import { 
  Sketch, Gender, SketchStatus, PaymentStatus, ProductionUnit, 
  ViewFilter, PASSWORD_SECRET 
} from './types';
import { sketchService } from './services/sketchService';
import { NeonButton, NeonCard, NeonInput, NeonToggle, NeonTextarea } from './components/NeonUI';

// --- Helper: Robust UUID Generator ---
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Helper: Format Date for Input (YYYY-MM-DDTHH:mm) ---
// This strips seconds and timezone to make it compatible with <input type="datetime-local" />
const formatDateForInput = (dateString?: string | number) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const pad = (num: number) => num.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// --- Login Component ---
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === PASSWORD_SECRET) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <NeonCard color="blue" className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8 text-neon-blue font-mono tracking-tighter shadow-neon-blue drop-shadow-md">
          MNR SYSTEM
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <NeonInput 
            label="Security Access" 
            type="password" 
            placeholder="Enter Passcode"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError(false);
            }}
            color="blue"
          />
          {error && <p className="text-red-500 text-sm">ACCESS DENIED</p>}
          <NeonButton type="submit" variant="blue" className="w-full">
            Unlock Terminal
          </NeonButton>
        </form>
      </NeonCard>
    </div>
  );
};

// --- Animated Logo (No Blinking) ---
const AnimatedLogo = () => (
  <div className="relative w-24 h-24 flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform duration-500">
    {/* Glow Background - No Pulse */}
    <div className="absolute inset-0 bg-neon-blue/10 blur-xl rounded-full"></div>
    
    {/* Ring 1: Outer Slow Clockwise */}
    <div className="absolute w-full h-full border-[1px] border-t-neon-blue border-r-transparent border-b-neon-blue border-l-transparent rounded-full animate-spin-slow shadow-[0_0_10px_rgba(0,243,255,0.2)]"></div>
    
    {/* Ring 2: Middle Counter-Clockwise */}
    <div className="absolute w-[85%] h-[85%] border-[1px] border-neon-magenta border-dashed rounded-full animate-spin-reverse opacity-80"></div>
    
    {/* Ring 3: Inner Fast Clockwise */}
    <div className="absolute w-[70%] h-[70%] border-[2px] border-t-neon-yellow border-r-neon-yellow border-b-transparent border-l-transparent rounded-full animate-spin-medium opacity-90"></div>

    {/* Ring 4: Static Decorative Ring */}
    <div className="absolute w-[95%] h-[95%] border border-white/5 rounded-full"></div>

    {/* Center Core */}
    <div className="relative z-10 flex flex-col items-center justify-center bg-black/90 w-[55%] h-[55%] rounded-full border border-gray-700 backdrop-blur-md shadow-inner group-hover:border-neon-blue transition-colors duration-300">
      <span className="block text-[10px] text-neon-blue font-bold tracking-widest leading-none mb-0.5 drop-shadow-[0_0_2px_rgba(0,243,255,0.8)]">MNR</span>
      <span className="block text-[8px] text-neon-green tracking-tighter leading-none drop-shadow-[0_0_2px_rgba(0,255,65,0.8)]">SKETCH</span>
    </div>
  </div>
);

// --- Main App ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [designerSearch, setDesignerSearch] = useState('');
  
  // Expanded Menu State
  const [expandPayments, setExpandPayments] = useState(false);
  const [expandProduction, setExpandProduction] = useState(false);

  // Form State
  const initialFormState: Sketch = {
    id: '',
    orderNumber: '',
    importDate: formatDateForInput(Date.now()), // Fix: Use formatted local time
    exportDate: '',
    gender: Gender.GENTS,
    status: SketchStatus.PROCESSING,
    designerName: '',
    paymentStatus: PaymentStatus.PENDING,
    paymentAmount: '',
    productionUnit: ProductionUnit.MNR_PRODUCTION,
    createdAt: Date.now(),
    processingItems: '',
    completedItems: ''
  };

  const [formData, setFormData] = useState<Sketch>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // Load Data
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        setIsLoading(true);
        const data = await sketchService.getAll();
        setSketches(data);
        setIsLoading(false);
      };

      loadData();
      
      const cleanup = sketchService.listenForUpdates((data) => {
        setSketches(data);
      });
      
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [isAuthenticated]);

  // Calculate Counts
  const counts = useMemo(() => {
    return {
      all: sketches.length,
      processing: sketches.filter(s => s.status === SketchStatus.PROCESSING).length,
      delivered: sketches.filter(s => s.status === SketchStatus.DELIVERED).length,
      pending: sketches.filter(s => s.paymentStatus === PaymentStatus.PENDING).length,
      half: sketches.filter(s => s.paymentStatus === PaymentStatus.HALF).length,
      complete: sketches.filter(s => s.paymentStatus === PaymentStatus.COMPLETE).length,
      hafiz: sketches.filter(s => s.productionUnit === ProductionUnit.HAFIZ_SAHIB).length,
      rana: sketches.filter(s => s.productionUnit === ProductionUnit.RANA_PLAZA).length,
      mnr: sketches.filter(s => s.productionUnit === ProductionUnit.MNR_PRODUCTION).length,
    };
  }, [sketches]);

  // Handle Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderNumber) return alert("Order Number is required!");

    setIsLoading(true);
    const payload = {
      ...formData,
      id: formData.id || generateUUID(),
      createdAt: formData.createdAt || Date.now()
    };

    try {
      const newSketches = await sketchService.save(payload);
      setSketches(newSketches);
      setFormData({ ...initialFormState, id: '' });
      setIsEditing(false);
    } catch (error) {
      alert("Error saving data. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sketch?")) {
      setIsLoading(true);
      try {
        const newSketches = await sketchService.delete(id);
        setSketches(newSketches);
        if (formData.id === id) {
          setFormData({ ...initialFormState, id: '' });
          setIsEditing(false);
        }
      } catch (error) {
        alert("Error deleting.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (sketch: Sketch) => {
    setFormData({
      ...sketch,
      // Fix: Ensure dates coming from DB are formatted for input box
      importDate: formatDateForInput(sketch.importDate),
      exportDate: formatDateForInput(sketch.exportDate),
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Logic
  const filteredSketches = useMemo(() => {
    let result = sketches;

    if (searchQuery) {
      return result.filter(s => s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    switch (viewFilter) {
      case 'PROCESSING':
        result = result.filter(s => s.status === SketchStatus.PROCESSING);
        break;
      case 'DELIVERED':
        result = result.filter(s => s.status === SketchStatus.DELIVERED);
        break;
      case 'DESIGNER':
        if (designerSearch) {
          result = result.filter(s => s.designerName.toLowerCase().includes(designerSearch.toLowerCase()));
        }
        break;
      case 'PAYMENT_PENDING':
        result = result.filter(s => s.paymentStatus === PaymentStatus.PENDING);
        break;
      case 'PAYMENT_HALF':
        result = result.filter(s => s.paymentStatus === PaymentStatus.HALF);
        break;
      case 'PAYMENT_COMPLETE':
        result = result.filter(s => s.paymentStatus === PaymentStatus.COMPLETE);
        break;
      case 'PROD_HAFIZ':
        result = result.filter(s => s.productionUnit === ProductionUnit.HAFIZ_SAHIB);
        break;
      case 'PROD_RANA':
        result = result.filter(s => s.productionUnit === ProductionUnit.RANA_PLAZA);
        break;
      case 'PROD_MNR':
        result = result.filter(s => s.productionUnit === ProductionUnit.MNR_PRODUCTION);
        break;
      default:
        break;
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [sketches, viewFilter, searchQuery, designerSearch]);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const MenuItem = ({ label, active, onClick, icon, count }: any) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded flex items-center justify-between transition-all group ${
        active 
          ? 'bg-neon-blue/10 text-neon-blue border-l-2 border-neon-blue' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && React.cloneElement(icon, { size: 18, className: active ? 'text-neon-blue' : 'text-gray-500 group-hover:text-white' })}
        <span className="font-semibold tracking-wide text-sm">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center ${
          active ? 'bg-neon-blue text-black' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-20">
      
      {/* --- Header --- */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800 h-28 flex items-center justify-between px-4 lg:px-8 shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-neon-blue hover:bg-neon-blue/10 rounded-full transition-colors"
          >
            <Menu size={32} />
          </button>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer mt-2" onClick={() => setViewFilter('ALL')}>
          <AnimatedLogo />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className={`flex items-center bg-gray-900 border ${searchQuery ? 'border-neon-yellow w-48' : 'border-gray-700 w-10 group-hover:w-48'} h-10 rounded-full transition-all duration-300 overflow-hidden`}>
              <div className="min-w-[40px] h-full flex items-center justify-center text-neon-yellow">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Order #"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm w-full pr-4 placeholder-gray-600"
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- Sidebar Menu --- */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 w-80 h-full bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex justify-between items-center border-b border-gray-800">
            <h2 className="text-xl font-bold text-neon-blue">NAVIGATION</h2>
            <button onClick={() => setIsMenuOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
          </div>
          <div className="p-4 space-y-2">
            <MenuItem 
              label="TOTAL SKETCH" 
              active={viewFilter === 'ALL'} 
              onClick={() => { setViewFilter('ALL'); setIsMenuOpen(false); }}
              icon={<Package size={18} />}
              count={counts.all}
            />
            <MenuItem 
              label="PROCESSING" 
              active={viewFilter === 'PROCESSING'} 
              onClick={() => { setViewFilter('PROCESSING'); setIsMenuOpen(false); }}
              icon={<Clock size={18} />}
              count={counts.processing}
            />
            <MenuItem 
              label="DELIVERED" 
              active={viewFilter === 'DELIVERED'} 
              onClick={() => { setViewFilter('DELIVERED'); setIsMenuOpen(false); }}
              icon={<CheckCircle size={18} />}
              count={counts.delivered}
            />
            
            <div className="pt-2 pb-2">
               <div className="text-gray-500 text-xs uppercase mb-1 ml-3">Search Designer</div>
               <div className="flex px-3 mb-2">
                  <input 
                    type="text" 
                    placeholder="Designer Name..." 
                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:border-neon-magenta outline-none"
                    value={designerSearch}
                    onChange={(e) => {
                      setDesignerSearch(e.target.value);
                      setViewFilter('DESIGNER');
                    }}
                  />
               </div>
            </div>

            <div className="border-t border-gray-800 pt-2">
              <button 
                onClick={() => setExpandPayments(!expandPayments)}
                className="w-full text-left p-3 rounded flex items-center justify-between text-gray-400 hover:text-white"
              >
                <div className="flex items-center gap-3"><DollarSign size={18} /> <span>PAYMENTS</span></div>
                {expandPayments ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandPayments && (
                <div className="pl-8 space-y-1">
                  <MenuItem 
                    label="Pending" 
                    active={viewFilter === 'PAYMENT_PENDING'} 
                    onClick={() => { setViewFilter('PAYMENT_PENDING'); setIsMenuOpen(false); }} 
                    count={counts.pending}
                  />
                  <MenuItem 
                    label="Half Payment" 
                    active={viewFilter === 'PAYMENT_HALF'} 
                    onClick={() => { setViewFilter('PAYMENT_HALF'); setIsMenuOpen(false); }} 
                    count={counts.half}
                  />
                  <MenuItem 
                    label="Complete" 
                    active={viewFilter === 'PAYMENT_COMPLETE'} 
                    onClick={() => { setViewFilter('PAYMENT_COMPLETE'); setIsMenuOpen(false); }} 
                    count={counts.complete}
                  />
                </div>
              )}
            </div>

            <div>
              <button 
                onClick={() => setExpandProduction(!expandProduction)}
                className="w-full text-left p-3 rounded flex items-center justify-between text-gray-400 hover:text-white"
              >
                <div className="flex items-center gap-3"><Settings size={18} /> <span>PRODUCTION UNIT</span></div>
                {expandProduction ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandProduction && (
                <div className="pl-8 space-y-1">
                  <MenuItem 
                    label="Hafiz Sahib" 
                    active={viewFilter === 'PROD_HAFIZ'} 
                    onClick={() => { setViewFilter('PROD_HAFIZ'); setIsMenuOpen(false); }} 
                    count={counts.hafiz}
                  />
                  <MenuItem 
                    label="Rana Plaza" 
                    active={viewFilter === 'PROD_RANA'} 
                    onClick={() => { setViewFilter('PROD_RANA'); setIsMenuOpen(false); }} 
                    count={counts.rana}
                  />
                  <MenuItem 
                    label="MNR Production" 
                    active={viewFilter === 'PROD_MNR'} 
                    onClick={() => { setViewFilter('PROD_MNR'); setIsMenuOpen(false); }} 
                    count={counts.mnr}
                  />
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-800">
               <button onClick={() => setIsAuthenticated(false)} className="w-full p-3 flex items-center gap-3 text-red-500 hover:bg-red-900/20 rounded">
                 <LogOut size={18} /> Sign Out
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 pt-8 max-w-6xl">
        
        {/* SKETCH BLOCK (Form) */}
        <NeonCard 
          color={isEditing ? 'yellow' : 'blue'} 
          className="mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-neon-blue to-transparent"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-widest text-white drop-shadow-lg">
              {isEditing ? 'EDIT SKETCH DETAILS' : 'NEW SKETCH ENTRY'}
            </h2>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setFormData({...initialFormState, id: ''}); }} className="text-gray-400 hover:text-white text-sm underline">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Row 1: Key Info */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
               <NeonInput 
                label="Order Number (Key)" 
                value={formData.orderNumber}
                onChange={e => setFormData({...formData, orderNumber: e.target.value})}
                placeholder="Ex: ORD-2023-001"
                color="blue"
                required
              />
               <NeonInput 
                label="Import Date" 
                type="datetime-local"
                value={formData.importDate}
                onChange={e => setFormData({...formData, importDate: e.target.value})}
                color="green"
              />
               <NeonInput 
                label="Export Date" 
                type="datetime-local"
                value={formData.exportDate}
                onChange={e => setFormData({...formData, exportDate: e.target.value})}
                color="green"
              />
            </div>

            {/* Row 2: Toggles & Details */}
            <div className="col-span-1 md:col-span-2 space-y-6 bg-white/5 p-4 rounded border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-gray-400">Gender</span>
                <NeonToggle 
                  leftLabel="GENTS" 
                  rightLabel="LADIES" 
                  value={formData.gender === Gender.LADIES}
                  onChange={(val) => setFormData({...formData, gender: val ? Gender.LADIES : Gender.GENTS})}
                  color="magenta"
                />
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-xs uppercase text-gray-400">Status</span>
                 <NeonToggle 
                  leftLabel="PROCESSING" 
                  rightLabel="DELIVERED" 
                  value={formData.status === SketchStatus.DELIVERED}
                  onChange={(val) => setFormData({...formData, status: val ? SketchStatus.DELIVERED : SketchStatus.PROCESSING})}
                  color="yellow"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <NeonInput 
                label="Designer Name" 
                value={formData.designerName}
                onChange={e => setFormData({...formData, designerName: e.target.value})}
                placeholder="Searchable Name"
                color="magenta"
              />
              <NeonTextarea 
                label="Processing Items" 
                value={formData.processingItems || ''}
                onChange={e => setFormData({...formData, processingItems: e.target.value})}
                placeholder="Items currently in process..."
                color="blue"
              />
              <NeonTextarea 
                label="Completed Items" 
                value={formData.completedItems || ''}
                onChange={e => setFormData({...formData, completedItems: e.target.value})}
                placeholder="Items finished..."
                color="green"
              />
            </div>

            {/* Row 3: Payment & Production */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
               <label className="text-xs uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Payment Status</label>
               <select 
                className="w-full bg-black border border-gray-700 text-neon-green rounded px-3 py-2 outline-none focus:border-neon-green"
                value={formData.paymentStatus}
                onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}
               >
                 {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-1">
               <NeonInput 
                label="Amount" 
                value={formData.paymentAmount || ''}
                onChange={e => setFormData({...formData, paymentAmount: e.target.value})}
                placeholder="0.00"
                color="green"
                type="number"
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-2">
               <label className="text-xs uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Production Unit</label>
               <select 
                className="w-full bg-black border border-gray-700 text-neon-yellow rounded px-3 py-2 outline-none focus:border-neon-yellow"
                value={formData.productionUnit}
                onChange={e => setFormData({...formData, productionUnit: e.target.value as ProductionUnit})}
               >
                 {Object.values(ProductionUnit).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            {/* Actions */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end gap-4 mt-4 pt-4 border-t border-gray-800">
              {isEditing && (
                 <button 
                  type="button"
                  onClick={() => handleDelete(formData.id)}
                  className="px-4 py-2 text-red-500 border border-red-500/50 rounded hover:bg-red-500/10 transition flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 size={16} /> DELETE
                </button>
              )}
              <NeonButton type="submit" variant={isEditing ? 'yellow' : 'green'} className="w-full md:w-auto min-w-[200px]" disabled={isLoading}>
                {isLoading ? 'SAVING...' : isEditing ? 'UPDATE SKETCH' : 'ADD NEW SKETCH'}
              </NeonButton>
            </div>
          </form>
        </NeonCard>

        {/* --- Recent Sketches Display (Max 7) --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl text-neon-blue font-bold tracking-widest">
              {viewFilter === 'ALL' && !searchQuery ? 'RECENTLY ADDED' : 'SEARCH RESULTS'}
            </h3>
            {isLoading && <span className="text-neon-yellow text-xs animate-pulse">SYNCING...</span>}
            <div className="h-px bg-gray-800 flex-grow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSketches.slice(0, 7).map((sketch) => (
              <div 
                key={sketch.id} 
                className={`relative group bg-gray-900 border border-gray-800 p-4 rounded-lg hover:border-neon-blue transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]`}
              >
                {/* Edit Action Overlay - IMPROVED WITH DELETE ICON */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(sketch); }} 
                    className="p-1 bg-neon-yellow text-black rounded hover:bg-white transition"
                    title="Edit Sketch"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(sketch.id); }} 
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    title="Delete Sketch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-mono font-bold text-white">{sketch.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded border ${sketch.gender === Gender.LADIES ? 'border-neon-magenta text-neon-magenta' : 'border-neon-blue text-neon-blue'}`}>
                    {sketch.gender}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-3">
                   <div className="flex justify-between">
                     <span>Designer:</span>
                     <span className="text-white">{sketch.designerName || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Production:</span>
                     <span className="text-neon-yellow">{sketch.productionUnit}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Status:</span>
                     <span className={sketch.status === SketchStatus.DELIVERED ? 'text-neon-green' : 'text-neon-blue'}>{sketch.status}</span>
                   </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className={`font-bold ${
                      sketch.paymentStatus === PaymentStatus.COMPLETE ? 'text-neon-green' : 
                      sketch.paymentStatus === PaymentStatus.HALF ? 'text-neon-yellow' : 'text-red-500'
                    }`}>
                      {sketch.paymentStatus}
                    </span>
                    {sketch.paymentAmount && (
                      <span className="text-white font-mono mt-0.5">Rs. {sketch.paymentAmount}</span>
                    )}
                  </div>
                  <span className="text-gray-600">{new Date(sketch.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            
            {filteredSketches.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-10 text-gray-600 border border-dashed border-gray-800 rounded">
                NO DATA FOUND
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 text-[10px] text-gray-700 pointer-events-none">
        Netlify Compatible Build v1.1 | Data Synced with Supabase
      </div>
    </div>
  );
}