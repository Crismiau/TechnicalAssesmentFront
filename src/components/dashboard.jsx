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

    // Normaliza y devuelve un id como `string` (o null si no existe)
    const getPid = (p) => {
        const id = p?.id ?? p?.projectId ?? p?._id ?? p?.ID ?? p?.uuid;
        return id != null ? String(id) : null;
    };

    // Busca objeto de proyecto por id normalizado
    const getProjectById = (id) => {
        if (!id) return null;
        return projects.find(p => getPid(p) === String(id)) || null;
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            console.debug('fetchProjects response:', res.data);
            // Normalizar diferentes formas de respuesta (array, Page, wrapper)
            const d = res.data;
            let items = [];
            if (Array.isArray(d)) items = d;
            else if (Array.isArray(d?.content)) items = d.content;
            else if (Array.isArray(d?.projects)) items = d.projects;
            else if (Array.isArray(d?.items)) items = d.items;
            else {
                for (const k of Object.keys(d || {})) {
                    if (Array.isArray(d[k])) { items = d[k]; break; }
                }
            }
            setProjects(items || []);
            console.debug('projects set, count=', (items || []).length);
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
            console.debug('createProject response:', res.data);
            setNewProjectName('');
            setNewProjectStatus('ACTIVE');
            setShowCreateProject(false);
            await fetchProjects();
            // select the new project if id returned (robusto a distintos nombres)
            const createdIdRaw = res?.data?.id || res?.data?.projectId || res?.data?._id || res?.data?.ID || res?.data?.uuid;
            const createdId = createdIdRaw != null ? String(createdIdRaw) : null;
            // si la respuesta incluye el proyecto creado como objeto, añadirlo inmediatamente al estado
            const createdObj = res?.data && typeof res.data === 'object' && (res.data.name || res.data.title) ? res.data : (res?.data?.project || null);
            if (createdObj) {
                setProjects(prev => {
                    // evitar duplicados por id
                    const id = getPid(createdObj) ?? createdId ?? `proj-new`;
                    if (prev.some(p => String(getPid(p)) === String(id))) return prev;
                    return [createdObj, ...prev];
                });
            }
            if (createdId) {
                setSelectedProjectId(createdId);
                fetchTasks(createdId);
            }
        } catch (err) { console.error(err); alert('Error al crear proyecto'); }
    };

    useEffect(() => { fetchProjects(); }, []);

    useEffect(() => { if (selectedProjectId) fetchTasks(selectedProjectId); else setProjectTasks([]); }, [selectedProjectId]);

    // proyecto seleccionado (objeto) para mostrar nombre y otros datos
    const selectedProject = getProjectById(selectedProjectId);

    // Maneja la selección de proyecto: usa tareas embebidas si existen, o solicita al backend
    const handleSelectProject = (id) => {
        setSelectedProjectId(id);
        const proj = getProjectById(id);
        // normalizar posibles campos con tareas
        const embedded = proj?.tasks ?? proj?.projectTasks ?? proj?.items ?? proj?.children ?? null;
        if (Array.isArray(embedded) && embedded.length > 0) {
            setProjectTasks(embedded);
        } else {
            // pedir al backend (fetchTasks manejará errores y vacíos)
            fetchTasks(id);
        }
    };

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
                        {projects.map((p, idx) => {
                            const pid = getPid(p) ?? `proj-${idx}`;
                            const pname = p.name || p.title || p.nombre || 'Proyecto';
                            const pstatus = p.status || '';
                            const isSelected = String(selectedProjectId) === String(pid);
                            return (
                                <button
                                    type="button"
                                    key={pid}
                                    onClick={() => handleSelectProject(pid)}
                                    className={`w-full text-left p-4 border rounded-xl transition-flex items-center ${isSelected ? 'bg-black text-white shadow-md' : 'bg-white hover:shadow-md'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{pname}</p>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-600">{pstatus}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Columna Tareas */}
                <section className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Tareas del Proyecto</h2>
                    {!selectedProjectId ? (
                        <p className="text-gray-400">Selecciona un proyecto para ver y gestionar sus tareas</p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 mb-4">Proyecto seleccionado: {selectedProject?.name || selectedProjectId}</p>

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
                                    projectTasks.map((t, idx) => {
                                        const tid = String(t.id ?? t.taskId ?? t._id ?? `task-${idx}`);
                                        const tname = t.name || t.title || 'Tarea';
                                        return (
                                            <div key={tid} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{tname}</p>
                                                    <p className="text-xs text-gray-500">{t.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-600">{t.status || ''}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}