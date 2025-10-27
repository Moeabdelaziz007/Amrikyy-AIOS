import React from 'react';
import { Project } from '../../types';

interface ProjectsWidgetProps {
    projects: Project[];
}

const ProjectsWidget: React.FC<ProjectsWidgetProps> = ({ projects }) => {
    return (
        <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-lg">work</span>
                    <h2 className="font-medium text-sm">Active Projects</h2>
                </div>
            </div>
            <div className="space-y-3 p-4">
                {projects.map(project => (
                    <div key={project.id}>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold">{project.name}</p>
                            <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">{project.status}</span>
                        </div>
                        <p className="text-xs text-text-muted">Earnings: ${project.earnings}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsWidget;