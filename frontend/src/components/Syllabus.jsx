import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // ✅ USE CENTRAL API
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; 
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BookOpen, Trash2, LayoutDashboard, GraduationCap, Award, Library, Lock, BarChart2, Plus, GripVertical, Sparkles, X, Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Syllabus = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState({});
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) navigate('/login');
    else { const userObj = JSON.parse(userData); fetchSubjects(userObj.id || userObj._id); }
  }, [navigate]);

  const fetchSubjects = async (userId) => { try { const res = await api.get(`/api/syllabus/${userId}`); setSubjects(res.data); } catch (err) { } };
  
  const addSubject = async (e) => { e.preventDefault(); if (!newSubject) return; try { const userData = JSON.parse(localStorage.getItem('user')); const res = await api.post('/api/syllabus', { userId: userData.id || userData._id, subjectTitle: newSubject }); setSubjects([...subjects, res.data]); setNewSubject(''); } catch (err) { } };
  
  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    setIsGenerating(true);
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const res = await api.post('/api/ai/generate', {
            userId: userData.id || userData._id,
            text: aiInput
        });
        setSubjects([...subjects, res.data]); 
        setShowAiModal(false);
        setAiInput('');
    } catch (err) {
        alert("AI Failed. Ensure Backend is running.");
    } finally {
        setIsGenerating(false);
    }
  };

  const addChapter = async (subjectId) => { const title = newChapter[subjectId]; if (!title || !title.trim()) return; try { const res = await api.post(`/api/syllabus/chapter/${subjectId}`, { title }); updateSubjectInState(res.data); setNewChapter({ ...newChapter, [subjectId]: '' }); } catch (err) { } };
  const toggleChapter = async (subjectId, chapterId) => { try { const res = await api.put(`/api/syllabus/chapter/${subjectId}/${chapterId}`); updateSubjectInState(res.data); } catch (err) { } };
  const deleteChapter = async (subjectId, chapterId) => { try { const res = await api.delete(`/api/syllabus/chapter/${subjectId}/${chapterId}`); updateSubjectInState(res.data); } catch (err) { } };
  const deleteSubject = async (subjectId) => { if (!window.confirm("Delete subject?")) return; try { await api.delete(`/api/syllabus/${subjectId}`); setSubjects(subjects.filter(s => s._id !== subjectId)); } catch (err) { } };
  const handleOnDragEnd = async (result, subjectId) => { if (!result.destination) return; const subjectIndex = subjects.findIndex(s => s._id === subjectId); const updatedChapters = Array.from(subjects[subjectIndex].chapters); const [reorderedItem] = updatedChapters.splice(result.source.index, 1); updatedChapters.splice(result.destination.index, 0, reorderedItem); const newSubjects = [...subjects]; newSubjects[subjectIndex].chapters = updatedChapters; setSubjects(newSubjects); try { await api.put(`/api/syllabus/reorder/${subjectId}`, { chapters: updatedChapters }); } catch (err) { } };
  const updateSubjectInState = (updatedSubject) => { setSubjects(subjects.map(s => s._id === updatedSubject._id ? updatedSubject : s)); };
  
  const getProgress = (chapters) => { if (chapters.length === 0) return 0; const completed = chapters.filter(c => c.isCompleted).length; return Math.round((completed / chapters.length) * 100); };
  const totalChapters = subjects.reduce((acc, s) => acc + s.chapters.length, 0);
  const doneChapters = subjects.reduce((acc, s) => acc + s.chapters.filter(c => c.isCompleted).length, 0);
  const masteredSubjects = subjects.filter(s => s.chapters.length > 0 && getProgress(s.chapters) === 100).length;

  const chartData = { labels: subjects.map(s => s.subjectTitle), datasets: [{ label: 'Mastery %', data: subjects.map(s => getProgress(s.chapters)), backgroundColor: '#0891b2', borderRadius: 6 }] };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: '#334155' } }, x: { grid: { display: false } } } };

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans pb-10 transition-colors duration-300">
      
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#151621] border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500"><Sparkles size={20} className="text-pink-500"/> AI Generator</h2>
                    <button onClick={() => setShowAiModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"><X size={20} /></button>
                </div>
                <p className="text-slate-400 text-sm mb-4">Paste syllabus text below (from PDF/Web) & AI will organize it.</p>
                <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="E.g. Unit 1: Python Basics..." className="w-full h-40 p-4 rounded-xl bg-[#0B0C15] border border-slate-700 outline-none text-white focus:border-pink-500 transition resize-none custom-scrollbar"></textarea>
                <div className="flex justify-end mt-4">
                    <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50">
                        {isGenerating ? <><Loader2 size={18} className="animate-spin"/> Generating...</> : <><Sparkles size={18}/> Generate Magic</>}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="bg-[#151621]/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3"><div className="bg-cyan-600 p-2 rounded-xl"><BookOpen size={20} className="text-white" /></div><span className="font-bold text-xl text-white">Syllabus Tracker</span></div>
        <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-indigo-500 transition"><LayoutDashboard size={20} /></button>
      </div>

      <div className="max-w-7xl mx-auto pt-8 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center"><h3 className="text-2xl font-bold text-white">{subjects.length}</h3><p className="text-sm opacity-70">Active Subjects</p></div>
             <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center"><h3 className="text-2xl font-bold text-white">{doneChapters} / {totalChapters}</h3><p className="text-sm opacity-70">Topics Mastered</p></div>
             <div className="bg-[#151621] border border-slate-800 rounded-3xl p-6"><h4 className="font-bold mb-4 flex items-center gap-2 text-white"><Award size={18} className="text-yellow-500" /> Badges</h4><div className="flex gap-2 justify-between"><MiniBadge title="Scholar" unlocked={doneChapters >= 10} icon="📖" /><MiniBadge title="Professor" unlocked={masteredSubjects >= 1} icon="🎓" /><MiniBadge title="Genius" unlocked={doneChapters >= 50} icon="🧠" /></div></div>
        </div>

        {subjects.length > 0 && (
            <div className="mb-10 bg-[#151621] p-6 rounded-3xl border border-slate-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-white"><BarChart2 size={20} className="text-indigo-500"/> Mastery Overview</h3>
                <div className="h-64 w-full"><Bar data={chartData} options={chartOptions} /></div>
            </div>
        )}

        <div className="mb-10 max-w-2xl mx-auto bg-[#151621] p-2 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-2">
            <form onSubmit={addSubject} className="flex-1 flex gap-2">
                <input type="text" placeholder="Add subject manually..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="flex-1 p-3 bg-transparent outline-none placeholder-slate-500 text-white" />
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold transition">Add</button>
            </form>
            <div className="w-px h-8 bg-slate-700 mx-1"></div>
            <button onClick={() => setShowAiModal(true)} className="bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2" title="Generate with AI"><Sparkles size={18} /> <span className="hidden md:inline">AI Magic</span></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const progress = getProgress(subject.chapters);
            return (
              <div key={subject._id} className="bg-[#151621] rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col h-full hover:border-cyan-500/50 transition">
                <div className="flex justify-between items-start mb-4"><h3 className="text-xl font-bold w-[85%] break-words text-white">{subject.subjectTitle}</h3><button onClick={() => deleteSubject(subject._id)} className="text-slate-500 hover:text-rose-500 transition"><Trash2 size={16} /></button></div>
                <div className="mb-6"><div className="flex justify-between text-xs mb-1"><span>Mastery</span><span className="text-cyan-500 font-bold">{progress}%</span></div><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-cyan-500 h-full rounded-full" style={{ width: `${progress}%` }}></div></div></div>
                <DragDropContext onDragEnd={(res) => handleOnDragEnd(res, subject._id)}>
                    <Droppable droppableId={subject._id}>
                      {(provided) => (
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-1 custom-scrollbar flex-grow" {...provided.droppableProps} ref={provided.innerRef}>
                          {subject.chapters.length === 0 && <div className="text-slate-500 text-sm text-center py-8">Drag & Drop topics here!</div>}
                          {subject.chapters.map((chapter, index) => (
                            <Draggable key={chapter._id} draggableId={chapter._id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} className="group/item flex items-center gap-3 bg-[#0B0C15] p-3 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition shadow-sm">
                                  <div {...provided.dragHandleProps} className="text-slate-500 cursor-grab hover:text-slate-300"><GripVertical size={14} /></div>
                                  <div onClick={() => toggleChapter(subject._id, chapter._id)} className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"><div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${chapter.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>{chapter.isCompleted && <span className="text-white text-[10px] font-bold">✓</span>}</div><span className={`text-sm truncate transition-colors ${chapter.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>{chapter.title}</span></div>
                                  <button onClick={() => deleteChapter(subject._id, chapter._id)} className="text-slate-500 hover:text-rose-500 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                </DragDropContext>
                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800"><input type="text" placeholder="Add topic..." value={newChapter[subject._id] || ''} onChange={(e) => setNewChapter({ ...newChapter, [subject._id]: e.target.value })} className="flex-1 bg-transparent text-sm outline-none placeholder-slate-500 text-white" onKeyDown={(e) => e.key === 'Enter' && addChapter(subject._id)} /><button onClick={() => addChapter(subject._id)} className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 p-1.5 rounded-lg transition"><Plus size={18} /></button></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MiniBadge = ({ title, unlocked, icon }) => ( <div className={`flex flex-col items-center justify-center p-3 rounded-xl border w-full text-center transition-all ${unlocked ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500' : 'bg-[#0B0C15] border-slate-800 opacity-50 grayscale'}`}><span className="text-2xl mb-1">{icon}</span><span className="text-[10px] font-bold uppercase">{title}</span>{!unlocked && <Lock size={12} className="mt-1" />}</div> );

export default Syllabus;