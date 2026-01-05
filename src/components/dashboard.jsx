import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [newTaskName, setNewTaskName] = useState('');
    const [projectTasks, setProjectTasks] = useState([]);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectStatus, setNewProjectStatus] = useState('ACTIVE');

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects'); 
            setProjects(res.data);
        } catch (err) { console.error('Error cargando proyectos', err); }
    };

    const fetchTasks = async (projectId) => {
        try {
            const res = await api.get(`/projects/${projectId}/tasks`);
            // Normalizar diferentes formas de respuesta:
            // - res.data -> array
            // - res.data.content -> Spring Page
            // - res.data.tasks | res.data.items
            let tasks = [];
            const d = res.data;
            if (Array.isArray(d)) tasks = d;
            else if (Array.isArray(d?.content)) tasks = d.content;
            else if (Array.isArray(d?.tasks)) tasks = d.tasks;
            else if (Array.isArray(d?.items)) tasks = d.items;
            else {
                // intentar encontrar la primera propiedad que sea array
                for (const k of Object.keys(d || {})) {
                    if (Array.isArray(d[k])) { tasks = d[k]; break; }
                }
            }
            setProjectTasks(tasks || []);
        } catch (err) { console.error('Error cargando tareas', err); setProjectTasks([]); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!selectedProjectId) return;
        try {
            const res = await api.post(`/projects/${selectedProjectId}/tasks`, { 
                name: newTaskName,
                description: 'Nueva tarea desde el front'
            });
            console.log('Create task response:', res?.data);
            setNewTaskName('');
            // intentar recargar tareas inmediatamente
            await fetchTasks(selectedProjectId);
            // si aún no se ve la tarea, reintentar una vez más tras 300ms (posibles eventual consistency)
            setTimeout(() => fetchTasks(selectedProjectId), 300);
            alert('Tarea creada');
        } catch (err) { console.error(err); alert('Error al crear tarea'); }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/projects', { name: newProjectName, status: newProjectStatus });
            setNewProjectName('');
            setNewProjectStatus('ACTIVE');
            setShowCreateProject(false);
            await fetchProjects();
            // select the new project if id returned
            const createdId = res?.data?.id;
            if (createdId) {
                setSelectedProjectId(createdId);
                fetchTasks(createdId);
            }
        } catch (err) { console.error(err); alert('Error al crear proyecto'); }
    };

    useEffect(() => { fetchProjects(); }, []);

    useEffect(() => { if (selectedProjectId) fetchTasks(selectedProjectId); else setProjectTasks([]); }, [selectedProjectId]);

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-black text-gray-900">Project Manager</h1>
                <div>
                    <button onClick={() => setShowCreateProject(!showCreateProject)} className="mr-3 bg-green-600 text-white px-4 py-2 rounded">Crear Proyecto</button>
                </div>
            </div>

            {showCreateProject && (
                <form onSubmit={handleCreateProject} className="mb-6 p-4 bg-white rounded shadow flex gap-3 items-center">
                    <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Nombre del proyecto" required className="p-2 border rounded" />
                    <select value={newProjectStatus} onChange={e => setNewProjectStatus(e.target.value)} className="p-2 border rounded">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PAUSED">PAUSED</option>
                        <option value="DONE">DONE</option>
                    </select>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Crear</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <section className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Tareas del Proyecto</h2>
                    {!selectedProjectId ? (
                        <p className="text-gray-400">Selecciona un proyecto para ver y gestionar sus tareas</p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 mb-4">Proyecto seleccionado: {selectedProjectId}</p>

                            <div className="mb-4">
                                <form onSubmit={handleCreateTask} className="flex gap-2">
                                    <input 
                                        value={newTaskName}
                                        onChange={e => setNewTaskName(e.target.value)}
                                        placeholder="Nombre de la tarea..."
                                        className="flex-1 p-2 border rounded-md"
                                        required
                                    />
                                    <button className="bg-black text-white px-4 rounded-md">Guardar Tarea</button>
                                </form>
                            </div>

                            <div className="space-y-3">
                                {projectTasks.length === 0 ? (
                                    <p className="text-gray-500">No hay tareas aún</p>
                                ) : (
                                    projectTasks.map(t => (
                                        <div key={t.id} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{t.name}</p>
                                                <p className="text-xs text-gray-500">{t.description}</p>
                                            </div>
                                            <span className="text-sm text-gray-600">{t.status || ''}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}