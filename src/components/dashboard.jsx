import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [newTaskName, setNewTaskName] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects'); 
            setProjects(res.data);
        } catch (err) { console.error("Error cargando proyectos", err); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!selectedProjectId) return;
        try {
            // Endpoint: POST /api/projects/{projectId}/tasks
            await api.post(`/projects/${selectedProjectId}/tasks`, { 
                name: newTaskName,
                description: "Nueva tarea desde el front"
            });
            setNewTaskName('');
            alert("Tarea creada");
        } catch (err) { alert("Error al crear tarea"); }
    };

    useEffect(() => { fetchProjects(); }, []);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-black mb-8 text-gray-900">Project Manager</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Proyectos */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Mis Proyectos</h2>
                    <div className="space-y-3">
                        {projects.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedProjectId(p.id)}
                                className={`p-4 border rounded-xl cursor-pointer transition ${selectedProjectId === p.id ? 'border-blue-500 bg-blue-50' : 'bg-white hover:shadow-md'}`}
                            >
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-600">{p.status}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Columna Tareas */}
                <section className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Añadir Tarea</h2>
                    {selectedProjectId ? (
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <p className="text-xs text-gray-500 italic">Añadiendo a proyecto: {selectedProjectId}</p>
                            <input 
                                value={newTaskName}
                                onChange={e => setNewTaskName(e.target.value)}
                                placeholder="Nombre de la tarea..."
                                className="w-full p-2 border rounded-md"
                                required
                            />
                            <button className="w-full bg-black text-white p-2 rounded-md hover:opacity-80 transition">
                                Guardar Tarea
                            </button>
                        </form>
                    ) : (
                        <p className="text-gray-400">Selecciona un proyecto para gestionar sus tareas</p>
                    )}
                </section>
            </div>
        </div>
    );
}