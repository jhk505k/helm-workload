import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

# Load environment variables
load_dotenv()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')


class AIRecommendationEngine:
    """
    AI-powered task assignment recommendation engine using Claude Sonnet 5.5
    """
    
    def __init__(self):
        self.api_key = EMERGENT_LLM_KEY
        self.model_provider = "anthropic"
        self.model_name = "claude-sonnet-5-5"
    
    async def generate_task_assignment_recommendation(
        self,
        task: Dict[str, Any],
        team_members: List[Dict[str, Any]],
        user_skills: Dict[str, List[Dict[str, Any]]],
        user_workloads: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered task assignment recommendation
        
        Args:
            task: Task details (title, description, skills_required, estimated_hours, etc.)
            team_members: List of team member profiles
            user_skills: Dictionary mapping user_id to their skills
            user_workloads: Dictionary mapping user_id to workload data
        
        Returns:
            Recommendation with assignee, reasoning, confidence, and impact metrics
        """
        
        # Build context for AI
        context = self._build_recommendation_context(task, team_members, user_skills, user_workloads)
        
        # Create prompt
        system_message = """You are an intelligent task assignment advisor for project management. 
Your role is to analyze tasks, team member skills, availability, and current workload to recommend 
the best person to assign each task to. You provide data-driven recommendations with clear reasoning.

Output your recommendation as JSON with this exact structure:
{
    "recommended_assignee_id": "user_id",
    "recommended_assignee_name": "Full Name",
    "confidence": 0.85,
    "reasoning": [
        "Bullet point 1 with specific data",
        "Bullet point 2 explaining skill match",
        "Bullet point 3 about availability",
        "Bullet point 4 about workload optimization"
    ],
    "impact_metrics": {
        "utilization_change": "+5%",
        "skill_match": "95%",
        "availability_fit": "High",
        "estimated_completion": "2-3 days"
    },
    "before_state": {
        "assignee": "Unassigned",
        "workload": "N/A",
        "utilization_rate": 0
    },
    "after_state": {
        "assignee": "Recommended Person",
        "workload": "Updated hours",
        "utilization_rate": 85
    }
}

Only output valid JSON, no markdown or explanations."""
        
        user_prompt = f"""Analyze this task and recommend the best team member to assign it to:

{context}

Consider:
1. Skill match (how well their skills align with required skills)
2. Current workload (avoid overloading, balance team capacity)
3. Availability (who has capacity this week)
4. Experience level (proficiency in required skills)

Provide your recommendation as JSON."""
        
        # Call Claude Sonnet 5.5
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"recommendation_{task.get('id', 'unknown')}",
                system_message=system_message
            ).with_model(self.model_provider, self.model_name)
            
            # Non-streaming call for structured output
            response = await chat.send_message(UserMessage(text=user_prompt))
            
            # Parse JSON response
            recommendation = self._parse_ai_response(response)
            
            # Add metadata
            recommendation['task_id'] = task.get('id')
            recommendation['task_title'] = task.get('title')
            recommendation['generated_at'] = datetime.now(timezone.utc).isoformat()
            
            return recommendation
            
        except Exception as e:
            print(f"AI recommendation error: {str(e)}")
            # Fallback to rule-based recommendation
            return self._fallback_recommendation(task, team_members, user_skills, user_workloads)
    
    def _build_recommendation_context(
        self,
        task: Dict[str, Any],
        team_members: List[Dict[str, Any]],
        user_skills: Dict[str, List[Dict[str, Any]]],
        user_workloads: Dict[str, Dict[str, Any]]
    ) -> str:
        """Build context string for AI prompt"""
        
        context = f"""TASK DETAILS:
- Title: {task.get('title', 'Untitled')}
- Description: {task.get('description', 'No description')}
- Required Skills: {', '.join(task.get('skills_required', ['None specified']))}
- Estimated Hours: {task.get('estimated_hours', 'Not specified')}
- Priority: {task.get('priority', 'medium')}
- Due Date: {task.get('due_date', 'Not specified')}

AVAILABLE TEAM MEMBERS:
"""
        
        for member in team_members:
            user_id = member.get('id')
            name = member.get('name', member.get('email', 'Unknown'))
            
            # Get skills
            skills = user_skills.get(user_id, [])
            skill_summary = []
            for skill in skills:
                skill_summary.append(
                    f"{skill.get('skill_name')} ({skill.get('proficiency', 'intermediate')}, "
                    f"{skill.get('years_experience', 0)} years)"
                )
            
            # Get workload
            workload = user_workloads.get(user_id, {})
            total_hours = workload.get('total_hours', 0)
            utilization = workload.get('utilization_rate', 0)
            status = workload.get('status', 'available')
            
            context += f"""
{name} (ID: {user_id}):
  - Skills: {', '.join(skill_summary) if skill_summary else 'No skills listed'}
  - Current Workload: {total_hours} hours this week
  - Utilization: {int(utilization * 100)}%
  - Status: {status}
  - Active Tasks: {workload.get('tasks_count', 0)}
"""
        
        return context
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI JSON response"""
        try:
            # Clean response (remove markdown if present)
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:]
            if response.startswith('```'):
                response = response[3:]
            if response.endswith('```'):
                response = response[:-3]
            response = response.strip()
            
            # Parse JSON
            data = json.loads(response)
            return data
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            raise ValueError(f"AI returned invalid JSON: {response[:200]}")
    
    def _fallback_recommendation(
        self,
        task: Dict[str, Any],
        team_members: List[Dict[str, Any]],
        user_skills: Dict[str, List[Dict[str, Any]]],
        user_workloads: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Fallback rule-based recommendation if AI fails"""
        
        required_skills = [s.lower() for s in task.get('skills_required', [])]
        
        # Score each team member
        scores = []
        for member in team_members:
            user_id = member.get('id')
            name = member.get('name', member.get('email', 'Unknown'))
            
            # Skill match score
            skills = user_skills.get(user_id, [])
            matched_skills = [
                s for s in skills 
                if s.get('skill_name', '').lower() in required_skills
            ]
            skill_score = len(matched_skills) / max(len(required_skills), 1) if required_skills else 0
            
            # Workload score (prefer less loaded)
            workload = user_workloads.get(user_id, {})
            utilization = workload.get('utilization_rate', 0)
            workload_score = max(0, 1 - utilization)
            
            # Combined score
            total_score = (skill_score * 0.7) + (workload_score * 0.3)
            
            scores.append({
                'user_id': user_id,
                'name': name,
                'score': total_score,
                'skill_match': skill_score,
                'workload': workload,
                'matched_skills': [s.get('skill_name') for s in matched_skills]
            })
        
        # Sort by score
        scores.sort(key=lambda x: x['score'], reverse=True)
        
        if not scores:
            raise ValueError("No team members available")
        
        best = scores[0]
        
        return {
            'recommended_assignee_id': best['user_id'],
            'recommended_assignee_name': best['name'],
            'confidence': round(best['score'], 2),
            'reasoning': [
                f"Skill match: {int(best['skill_match'] * 100)}% (matched: {', '.join(best['matched_skills']) or 'none'})",
                f"Current workload: {best['workload'].get('total_hours', 0)} hours this week",
                f"Utilization: {int(best['workload'].get('utilization_rate', 0) * 100)}%",
                "Recommended based on best skill-workload balance"
            ],
            'impact_metrics': {
                'skill_match': f"{int(best['skill_match'] * 100)}%",
                'utilization_change': "+5%",
                'availability_fit': "Medium",
                'estimated_completion': "Unknown"
            },
            'before_state': {
                'assignee': 'Unassigned',
                'workload': 'N/A',
                'utilization_rate': 0
            },
            'after_state': {
                'assignee': best['name'],
                'workload': f"{best['workload'].get('total_hours', 0) + task.get('estimated_hours', 0)} hours",
                'utilization_rate': int((best['workload'].get('utilization_rate', 0) + 0.05) * 100)
            },
            'task_id': task.get('id'),
            'task_title': task.get('title'),
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_batch_recommendations(
        self,
        unassigned_tasks: List[Dict[str, Any]],
        team_members: List[Dict[str, Any]],
        user_skills: Dict[str, List[Dict[str, Any]]],
        user_workloads: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for multiple tasks"""
        
        recommendations = []
        for task in unassigned_tasks[:5]:  # Limit to 5 tasks to avoid too many API calls
            try:
                rec = await self.generate_task_assignment_recommendation(
                    task, team_members, user_skills, user_workloads
                )
                recommendations.append(rec)
            except Exception as e:
                print(f"Error generating recommendation for task {task.get('id')}: {e}")
                continue
        
        return recommendations


# Initialize global instance
ai_engine = AIRecommendationEngine()
