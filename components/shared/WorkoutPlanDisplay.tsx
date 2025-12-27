import React from 'react';
import type { WorkoutPlan, WorkoutDay, Exercise } from '../../types.ts';
import { Button, Input, TextArea } from '../ui/common.tsx';

const downloadAsText = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

const WorkoutPlanDisplay: React.FC<{ 
    plan: WorkoutPlan, 
    clientName: string,
    isDraft?: boolean,
    isEditable?: boolean, 
    onPlanChange?: (plan: WorkoutPlan) => void 
}> = ({ plan, clientName, isDraft = false, isEditable = false, onPlanChange = () => {} }) => {
    const titleClass = isDraft ? "text-yellow-400" : "text-red-400";
    const titleText = isDraft ? `DRAFT: ${plan.plan_name}` : plan.plan_name;
    
    const handleDayChange = (dayIndex: number, field: keyof WorkoutDay, value: any) => {
        const newSchedule = [...plan.weekly_schedule];
        (newSchedule[dayIndex] as any)[field] = value;
        onPlanChange({ ...plan, weekly_schedule: newSchedule });
    };

    const handleExerciseChange = (dayIndex: number, exIndex: number, field: keyof Exercise, value: string) => {
        const newSchedule = [...plan.weekly_schedule];
        const newExercises = [...newSchedule[dayIndex].exercises];
        (newExercises[exIndex] as any)[field] = value;
        handleDayChange(dayIndex, 'exercises', newExercises);
    };

    const formatWorkoutPlanForDownload = (planToFormat: WorkoutPlan): string => {
        let content = `Workout Plan for ${clientName}: ${planToFormat.plan_name}\n`;
        content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
        content += `========================================\n\n`;

        planToFormat.weekly_schedule.forEach(day => {
            content += `--- DAY ${day.day}: ${day.focus} ---\n`;
            day.exercises.forEach(ex => {
                content += `- ${ex.name}: ${ex.sets} of ${ex.reps}, ${ex.rest} rest.\n`;
                if (ex.notes) content += `  Notes: ${ex.notes}\n`;
            });
            if (day.recovery_notes) content += `\nRecovery: ${day.recovery_notes}\n`;
            content += `\n`;
        });
        return content;
    };

    const handleDownload = () => {
        const textContent = formatWorkoutPlanForDownload(plan);
        const date = new Date(parseInt(plan.id.split('_')[1])).toISOString().split('T')[0];
        const filename = `WorkoutPlan-${clientName.replace(/\s/g, '_')}-${date}.txt`;
        downloadAsText(filename, textContent);
    };

    return (
    <div className={`prose prose-invert max-w-none text-gray-300 mt-6 ${isDraft ? 'p-4 border border-dashed border-yellow-600 rounded-lg bg-yellow-900/20' : ''}`}>
        <div className={`flex justify-between items-center border-b pb-2 mb-3 ${isDraft ? 'border-yellow-700' : 'border-gray-600'}`}>
            {isEditable ? <Input label="Plan Name" value={plan.plan_name} onChange={e => onPlanChange({...plan, plan_name: e.target.value})} className="text-lg font-bold !text-yellow-400" /> : <h4 className={`text-lg font-bold ${titleClass} border-none p-0 m-0`}>{titleText}</h4>}
             {!isEditable && !isDraft && (
                <Button variant="secondary" className="px-3 py-1 text-sm flex-shrink-0" onClick={handleDownload}>
                    <i className="fa-solid fa-download mr-2"></i>
                    Download
                </Button>
            )}
        </div>
        {plan.weekly_schedule.map((day: WorkoutDay, dayIndex: number) => (
            <div key={day.day} className="p-4 bg-gray-900/40 rounded-lg mb-3 border border-gray-700">
                {isEditable ? <Input label={`Day ${day.day} Focus`} value={day.focus} onChange={e => handleDayChange(dayIndex, 'focus', e.target.value)} /> : <p className="font-bold text-white">Day {day.day}: {day.focus}</p>}
                
                {isEditable ? (
                    <div className="space-y-2 mt-2">
                        {day.exercises.map((ex, exIndex) => (
                            <div key={exIndex} className="grid grid-cols-2 md:grid-cols-5 gap-2 border-b border-gray-700 pb-2">
                               <Input label="Exercise" value={ex.name} onChange={e => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)} />
                               <Input label="Sets" value={ex.sets} onChange={e => handleExerciseChange(dayIndex, exIndex, 'sets', e.target.value)} />
                               <Input label="Reps" value={ex.reps} onChange={e => handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)} />
                               <Input label="Rest" value={ex.rest} onChange={e => handleExerciseChange(dayIndex, exIndex, 'rest', e.target.value)} />
                               <Input label="Notes" value={ex.notes || ''} onChange={e => handleExerciseChange(dayIndex, exIndex, 'notes', e.target.value)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2">
                        {day.exercises.map((ex: Exercise, idx: number) => (
                            <li key={idx}><strong>{ex.name}:</strong> {ex.sets} of {ex.reps}, {ex.rest} rest. {ex.notes && <span className="text-gray-400 text-sm italic">({ex.notes})</span>}</li>
                        ))}
                    </ul>
                )}
                 
                 <div className="mt-3 pt-2 border-t border-gray-700/50">
                    {isEditable ? <TextArea label="Recovery Notes" value={day.recovery_notes || ''} onChange={e => handleDayChange(dayIndex, 'recovery_notes', e.target.value)} rows={2} /> : (
                        day.recovery_notes && <>
                            <p className="font-semibold text-gray-200 text-sm">Recovery:</p>
                            <p className="text-sm text-gray-400 italic">{day.recovery_notes}</p>
                        </>
                    )}
                </div>
            </div>
        ))}
    </div>
    )
};

export default WorkoutPlanDisplay;
