
import React from 'react';
import { Button } from '../components/system/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const ProjectDetailView = ({ project, onBack }: any) => {
    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <Button onClick={onBack} variant="outline" className="mb-4">
                <ArrowLeft size={16} className="mr-2" /> Back to Projects
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-500 mt-2">Project ID: {project.code}</p>
            <div className="mt-8 p-8 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                Detailed project view placeholder
            </div>
        </div>
    );
};
