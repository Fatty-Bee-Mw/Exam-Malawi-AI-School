"""
AI Tutor System for Exam AI Malawi
Intelligent tutoring with educational focus, weakness tracking, and personalized responses
"""

import re
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class AITutor:
    def __init__(self):
        self.educational_subjects = {
            'mathematics': ['algebra', 'geometry', 'calculus', 'statistics', 'arithmetic', 'trigonometry'],
            'science': ['biology', 'chemistry', 'physics', 'environmental science'],
            'english': ['grammar', 'literature', 'writing', 'reading comprehension', 'vocabulary'],
            'social_studies': ['history', 'geography', 'civics', 'economics'],
            'chichewa': ['grammar', 'literature', 'writing', 'vocabulary'],
            'french': ['grammar', 'vocabulary', 'conversation', 'literature']
        }
        
        self.greeting_patterns = [
            r'\b(hello|hi|hey|good morning|good afternoon|good evening|greetings)\b',
            r'\b(how are you|what\'s up|howdy)\b',
            r'\b(nice to meet you|pleased to meet you)\b'
        ]
        
        self.goodbye_patterns = [
            r'\b(goodbye|bye|see you|farewell|take care)\b',
            r'\b(thanks|thank you|appreciate|grateful)\b.*\b(help|assistance|service)\b',
            r'\b(that\'s all|i\'m done|finished|complete)\b',
            r'\b(no more questions|nothing else)\b'
        ]
        
        self.understanding_patterns = [
            r'\b(yes|yeah|yep|ok|okay|understand|got it|clear|makes sense)\b',
            r'\b(i follow|i get it|i see|understood|right)\b'
        ]
        
        self.confusion_patterns = [
            r'\b(no|nope|don\'t understand|confused|unclear|lost)\b',
            r'\b(can you explain|repeat|again|simpler|easier)\b',
            r'\b(i don\'t get it|hard to understand|difficult)\b'
        ]
        
        # Load user weakness tracking
        self.weakness_file = Path("user_weaknesses.json")
        self.user_weaknesses = self._load_weaknesses()
        
    def _load_weaknesses(self) -> Dict[str, Any]:
        """Load user weakness tracking data"""
        try:
            if self.weakness_file.exists():
                with open(self.weakness_file, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            logger.error(f"Failed to load weaknesses: {e}")
            return {}
    
    def _save_weaknesses(self):
        """Save user weakness tracking data"""
        try:
            with open(self.weakness_file, 'w') as f:
                json.dump(self.user_weaknesses, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save weaknesses: {e}")
    
    def _is_greeting(self, message: str) -> bool:
        """Check if message is a greeting"""
        message_lower = message.lower()
        return any(re.search(pattern, message_lower) for pattern in self.greeting_patterns)
    
    def _is_goodbye(self, message: str) -> bool:
        """Check if message is a goodbye or completion"""
        message_lower = message.lower()
        return any(re.search(pattern, message_lower) for pattern in self.goodbye_patterns)
    
    def _is_understanding(self, message: str) -> bool:
        """Check if user indicates understanding"""
        message_lower = message.lower()
        return any(re.search(pattern, message_lower) for pattern in self.understanding_patterns)
    
    def _is_confused(self, message: str) -> bool:
        """Check if user indicates confusion"""
        message_lower = message.lower()
        return any(re.search(pattern, message_lower) for pattern in self.confusion_patterns)
    
    def _is_educational(self, message: str) -> bool:
        """Check if message is related to education"""
        message_lower = message.lower()
        
        # Check for subject keywords
        for subject, topics in self.educational_subjects.items():
            if subject in message_lower:
                return True
            for topic in topics:
                if topic in message_lower:
                    return True
        
        # Check for educational keywords
        educational_keywords = [
            'learn', 'study', 'teach', 'explain', 'homework', 'assignment',
            'exam', 'test', 'quiz', 'lesson', 'chapter', 'syllabus',
            'question', 'answer', 'solve', 'calculate', 'define',
            'what is', 'how to', 'why does', 'when did', 'where is'
        ]
        
        return any(keyword in message_lower for keyword in educational_keywords)
    
    def _identify_subject(self, message: str) -> Optional[str]:
        """Identify the subject from the message"""
        message_lower = message.lower()
        
        for subject, topics in self.educational_subjects.items():
            if subject in message_lower:
                return subject
            for topic in topics:
                if topic in message_lower:
                    return subject
        return None
    
    def _track_weakness(self, user_id: str, subject: str, topic: str, difficulty: str):
        """Track user weaknesses for personalized help"""
        if user_id not in self.user_weaknesses:
            self.user_weaknesses[user_id] = {
                'subjects': {},
                'last_updated': datetime.now().isoformat()
            }
        
        if subject not in self.user_weaknesses[user_id]['subjects']:
            self.user_weaknesses[user_id]['subjects'][subject] = {}
        
        if topic not in self.user_weaknesses[user_id]['subjects'][subject]:
            self.user_weaknesses[user_id]['subjects'][subject][topic] = {
                'attempts': 0,
                'difficulties': [],
                'last_attempt': None
            }
        
        topic_data = self.user_weaknesses[user_id]['subjects'][subject][topic]
        topic_data['attempts'] += 1
        topic_data['difficulties'].append(difficulty)
        topic_data['last_attempt'] = datetime.now().isoformat()
        
        self._save_weaknesses()
    
    def _get_user_weaknesses(self, user_id: str) -> List[str]:
        """Get user's weak areas for personalized recommendations"""
        if user_id not in self.user_weaknesses:
            return []
        
        weak_areas = []
        user_data = self.user_weaknesses[user_id]['subjects']
        
        for subject, topics in user_data.items():
            for topic, data in topics.items():
                if data['attempts'] >= 2:  # Multiple attempts indicate difficulty
                    avg_difficulty = sum(1 if d == 'hard' else 0.5 if d == 'medium' else 0 
                                       for d in data['difficulties']) / len(data['difficulties'])
                    if avg_difficulty > 0.5:  # Struggling with this topic
                        weak_areas.append(f"{subject} - {topic}")
        
        return weak_areas
    
    def _generate_greeting_response(self, user_name: str = None, is_premium: bool = False) -> str:
        """Generate a friendly greeting response"""
        name_part = f", {user_name}" if user_name else ""
        
        greetings = [
            f"Hello{name_part}! 👋 Welcome to Exam AI Malawi! I'm your personal AI tutor, ready to help you with your studies.",
            f"Hi there{name_part}! 😊 Great to see you! I'm here to help you learn and understand Malawian educational content.",
            f"Good day{name_part}! 🌟 I'm your AI study companion, specialized in Malawian curriculum. What would you like to learn today?"
        ]
        
        greeting = greetings[hash(str(datetime.now().hour)) % len(greetings)]
        
        if not is_premium:
            greeting += "\n\n💡 **Tip:** Upgrade to Premium for unlimited questions and advanced features!"
        
        return greeting
    
    def _generate_goodbye_response(self, user_name: str = None, is_premium: bool = False) -> str:
        """Generate a friendly goodbye response"""
        name_part = f" {user_name}" if user_name else ""
        
        goodbyes = [
            f"Thank you for using Exam AI Malawi{name_part}! 🙏 Come back anytime you need help with your studies. Keep learning and growing! 📚✨",
            f"It was great helping you learn today{name_part}! 😊 Remember, I'm here whenever you need educational support. Best of luck with your studies! 🌟",
            f"Goodbye{name_part}! 👋 Thank you for choosing Exam AI Malawi for your learning journey. See you next time you need academic assistance! 📖"
        ]
        
        goodbye = goodbyes[hash(str(datetime.now().minute)) % len(goodbyes)]
        
        if not is_premium:
            goodbye += "\n\n🚀 **Consider upgrading to Premium** for unlimited access and advanced tutoring features!"
        
        return goodbye
    
    def _generate_non_educational_response(self, user_name: str = None, is_premium: bool = False) -> str:
        """Generate response for non-educational queries"""
        name_part = f" {user_name}" if user_name else ""
        
        response = f"""I appreciate your question{name_part}, but I'm specifically designed to help with **Malawian educational content** only! 📚

🎯 **What I can help you with:**
• Mathematics (Algebra, Geometry, Statistics, etc.)
• Science (Biology, Chemistry, Physics)
• English (Grammar, Literature, Writing)
• Social Studies (History, Geography, Civics)
• Chichewa (Grammar, Literature, Vocabulary)
• French (Grammar, Vocabulary, Conversation)

🎓 **My purpose:** I'm your dedicated AI tutor for the Malawian curriculum, designed to help students excel in their studies with personalized, easy-to-understand explanations.

Please ask me anything related to your school subjects, homework, or exam preparation!"""

        if not is_premium:
            response += "\n\n✨ **Premium users** get priority support and advanced tutoring features!"
        
        return response
    
    def _generate_educational_response(self, message: str, subject: str, user_name: str = None, 
                                     is_premium: bool = False, user_id: str = None) -> str:
        """Generate educational response with tutoring approach"""
        name_part = f" {user_name}" if user_name else ""
        
        # Track this as an educational interaction
        if user_id and subject:
            self._track_weakness(user_id, subject, "general", "medium")
        
        # Get user's weak areas for personalized recommendations
        weak_areas = self._get_user_weaknesses(user_id) if user_id else []
        
        # This would typically call your AI model here
        # For now, providing a structured educational response template
        
        response = f"""Great question{name_part}! Let me help you understand this step by step. 📚

**Subject:** {subject.title() if subject else 'General Education'}

[This is where your AI model would generate the actual educational content based on the trained Malawian curriculum data]

**Key Points:**
• [Point 1 with clear explanation]
• [Point 2 with practical example]
• [Point 3 with real-world application]

**Example:** [Relevant example from Malawian context]

**Quick Check:** Do you follow this explanation so far{name_part}? If anything is unclear, just let me know and I'll explain it in simpler terms! 🤔"""

        # Add personalized recommendations based on weaknesses
        if weak_areas:
            response += f"\n\n💡 **Personal Tip:** I noticed you might want to review: {', '.join(weak_areas[:2])}. Would you like me to help with those topics too?"
        
        if not is_premium:
            response += f"\n\n🌟 **{user_name}**, upgrade to Premium for unlimited questions and detailed explanations!"
        
        return response
    
    def _generate_confusion_response(self, user_name: str = None, is_premium: bool = False) -> str:
        """Generate response when user is confused"""
        name_part = f" {user_name}" if user_name else ""
        
        response = f"""No worries{name_part}! Let me break this down into simpler steps. 😊

**Let's try a different approach:**

[Simplified explanation would go here]

**Think of it this way:** [Simple analogy or example]

**Step by step:**
1. [Simple step 1]
2. [Simple step 2] 
3. [Simple step 3]

Does this make more sense now{name_part}? I'm here to help until you fully understand! 💪"""

        if not is_premium:
            response += f"\n\n✨ **{user_name}**, Premium users get even more detailed, personalized explanations!"
        
        return response
    
    def process_message(self, message: str, user_name: str = None, is_premium: bool = False, 
                       user_id: str = None, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """Process user message and generate appropriate response"""
        
        # Check message type and generate appropriate response
        if self._is_greeting(message):
            response = self._generate_greeting_response(user_name, is_premium)
            response_type = "greeting"
            
        elif self._is_goodbye(message):
            response = self._generate_goodbye_response(user_name, is_premium)
            response_type = "goodbye"
            
        elif self._is_confused(message):
            response = self._generate_confusion_response(user_name, is_premium)
            response_type = "clarification"
            
        elif self._is_understanding(message):
            response = f"Excellent{f' {user_name}' if user_name else ''}! 🎉 I'm glad that makes sense. What would you like to learn next?"
            if not is_premium:
                response += f"\n\n🚀 **{user_name}**, keep up the great learning! Premium users get advanced practice questions too!"
            response_type = "acknowledgment"
            
        elif self._is_educational(message):
            subject = self._identify_subject(message)
            response = self._generate_educational_response(message, subject, user_name, is_premium, user_id)
            response_type = "educational"
            
        else:
            response = self._generate_non_educational_response(user_name, is_premium)
            response_type = "non_educational"
        
        return {
            "response": response,
            "type": response_type,
            "subject": self._identify_subject(message) if self._is_educational(message) else None,
            "requires_followup": response_type in ["educational", "clarification"],
            "user_weaknesses": self._get_user_weaknesses(user_id) if user_id else []
        }

# Global tutor instance
ai_tutor = AITutor()

def process_ai_message(message: str, user_name: str = None, is_premium: bool = False, 
                      user_id: str = None, conversation_history: List[Dict] = None) -> Dict[str, Any]:
    """Main function to process AI messages"""
    return ai_tutor.process_message(message, user_name, is_premium, user_id, conversation_history)
