import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch all projects using service role to process them in the background
        const projects = await base44.asServiceRole.entities.Project.list();
        let processed = 0;
        
        for (const project of projects) {
            if (project.isArchived) continue;
            
            // Get contentions for context
            const contentions = await base44.asServiceRole.entities.Contention.filter({ projectId: project.id });
            
            const prompt = `Review this debate project and suggest 1-2 specific improvements, fixes, or strategy updates. Focus on arguments, evidence, or flow.
Project Name: ${project.name}
Description: ${project.description || 'N/A'}
Resolution: ${project.resolution || 'N/A'}
Side: ${project.side || 'N/A'}

Contentions:
${contentions.map(c => `- ${c.title}`).join('\n')}

Reply ONLY with valid JSON exactly matching this schema:
{"suggestions": [{"title": "Short title", "description": "Detailed actionable advice on what to fix or update"}]}
`;

            const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" }
                                },
                                required: ["title", "description"]
                            }
                        }
                    },
                    required: ["suggestions"]
                }
            });

            if (res && res.suggestions) {
                for (const sug of res.suggestions) {
                    await base44.asServiceRole.entities.ProjectSuggestion.create({
                        projectId: project.id,
                        projectName: project.name,
                        title: sug.title,
                        description: sug.description,
                        userId: project.created_by_id,
                        created_by_id: project.created_by_id, // Ensure user can see it
                        status: "pending"
                    });
                }
            }
            processed++;
        }
        
        return Response.json({ success: true, processed });
    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});