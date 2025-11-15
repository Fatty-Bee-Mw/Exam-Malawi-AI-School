"""
Question Style Analyzer for Past Papers
Analyzes uploaded past papers to adapt question styles and formats for AI training
"""

import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class QuestionStyleAnalyzer:
    """Analyzes and extracts question patterns from past papers and educational content"""
    
    def __init__(self):
        self.question_patterns = {
            'multiple_choice': [
                r'(?i)(?:question\s+\d+[:\.]?\s*)?(.+?)\s*(?:\n|^)\s*[A-E][\.\)]\s*(.+?)(?:\n[A-E][\.\)]|\n\n|\Z)',
                r'(?i)choose\s+the\s+correct\s+answer',
                r'(?i)select\s+the\s+best\s+answer'
            ],
            'short_answer': [
                r'(?i)(?:question\s+\d+[:\.]?\s*)?(.+?)\s*\?\s*(?:\n|\Z)',
                r'(?i)(?:define|explain|describe|state|list|name)\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)what\s+is\s+(.+?)\?',
                r'(?i)how\s+(?:do|does|can|would)\s+(.+?)\?'
            ],
            'essay': [
                r'(?i)(?:question\s+\d+[:\.]?\s*)?discuss\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)(?:question\s+\d+[:\.]?\s*)?analyze\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)(?:question\s+\d+[:\.]?\s*)?evaluate\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)(?:question\s+\d+[:\.]?\s*)?compare\s+and\s+contrast\s+(.+?)(?:\?|\n|\Z)'
            ],
            'calculation': [
                r'(?i)(?:question\s+\d+[:\.]?\s*)?calculate\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)(?:question\s+\d+[:\.]?\s*)?find\s+the\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)(?:question\s+\d+[:\.]?\s*)?solve\s+(.+?)(?:\?|\n|\Z)',
                r'(?i)(?:question\s+\d+[:\.]?\s*)?determine\s+(.+?)(?:\?|\n|\Z)'
            ],
            'true_false': [
                r'(?i)(?:question\s+\d+[:\.]?\s*)?(.+?)\s*(?:true\s+or\s+false|t/f)(?:\?|\n|\Z)',
                r'(?i)state\s+whether\s+(.+?)\s+is\s+true\s+or\s+false'
            ]
        }
        
        self.answer_patterns = {
            'multiple_choice_answer': [
                r'(?i)answer[:\s]*([A-E])',
                r'(?i)correct\s+answer[:\s]*([A-E])',
                r'(?i)^([A-E])[\.\)]\s*(.+?)(?=\n[A-E][\.\)]|\n\n|\Z)'
            ],
            'short_answer_answer': [
                r'(?i)answer[:\s]*(.+?)(?:\n\n|\Z)',
                r'(?i)solution[:\s]*(.+?)(?:\n\n|\Z)'
            ],
            'marking_scheme': [
                r'(?i)marking\s+scheme[:\s]*(.+?)(?:\n\n|\Z)',
                r'(?i)mark\s+allocation[:\s]*(.+?)(?:\n\n|\Z)',
                r'(?i)\[(\d+)\s*marks?\]',
                r'(?i)\((\d+)\s*marks?\)'
            ]
        }
        
        self.subject_indicators = {
            'mathematics': ['equation', 'calculate', 'solve', 'graph', 'formula', 'theorem', 'proof'],
            'science': ['experiment', 'hypothesis', 'observe', 'reaction', 'element', 'compound'],
            'english': ['essay', 'paragraph', 'grammar', 'literature', 'poem', 'novel', 'author'],
            'history': ['date', 'event', 'century', 'war', 'independence', 'colonial', 'traditional'],
            'geography': ['climate', 'region', 'continent', 'river', 'mountain', 'population', 'urban']
        }
        
        self.difficulty_indicators = {
            'easy': ['define', 'state', 'list', 'name', 'identify'],
            'medium': ['explain', 'describe', 'compare', 'outline', 'summarize'],
            'hard': ['analyze', 'evaluate', 'discuss', 'assess', 'justify', 'critique']
        }
    
    def analyze_content(self, content: str, content_type: str = 'general') -> Dict[str, Any]:
        """
        Analyze educational content to extract question patterns and styles
        """
        analysis = {
            'content_type': content_type,
            'questions_found': [],
            'question_types': {},
            'subjects_detected': [],
            'difficulty_levels': {},
            'answer_formats': [],
            'marking_schemes': [],
            'question_count': 0,
            'has_answers': False,
            'style_patterns': {},
            'recommendations': []
        }
        
        try:
            # Clean and normalize content
            cleaned_content = self._clean_content(content)
            
            # Extract questions by type
            for q_type, patterns in self.question_patterns.items():
                questions = self._extract_questions_by_type(cleaned_content, q_type, patterns)
                if questions:
                    analysis['questions_found'].extend(questions)
                    analysis['question_types'][q_type] = len(questions)
            
            # Extract answers and marking schemes
            answers = self._extract_answers(cleaned_content)
            analysis['answer_formats'] = answers
            analysis['has_answers'] = len(answers) > 0
            
            # Detect subjects
            analysis['subjects_detected'] = self._detect_subjects(cleaned_content)
            
            # Analyze difficulty levels
            analysis['difficulty_levels'] = self._analyze_difficulty(cleaned_content)
            
            # Extract style patterns
            analysis['style_patterns'] = self._extract_style_patterns(cleaned_content)
            
            # Generate recommendations
            analysis['recommendations'] = self._generate_recommendations(analysis)
            
            analysis['question_count'] = len(analysis['questions_found'])
            
            logger.info(f"Analyzed content: {analysis['question_count']} questions found, "
                       f"types: {list(analysis['question_types'].keys())}")
            
        except Exception as e:
            logger.error(f"Error analyzing content: {e}")
            analysis['error'] = str(e)
        
        return analysis
    
    def _clean_content(self, content: str) -> str:
        """Clean and normalize content for analysis"""
        # Remove excessive whitespace
        content = re.sub(r'\s+', ' ', content)
        # Normalize line breaks
        content = re.sub(r'\n\s*\n', '\n\n', content)
        # Remove page numbers and headers
        content = re.sub(r'(?i)page\s+\d+', '', content)
        content = re.sub(r'(?i)examination\s+\d{4}', '', content)
        return content.strip()
    
    def _extract_questions_by_type(self, content: str, q_type: str, patterns: List[str]) -> List[Dict[str, Any]]:
        """Extract questions of a specific type using patterns"""
        questions = []
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
            for match in matches:
                question_text = match.group(1) if match.groups() else match.group(0)
                question_text = question_text.strip()
                
                if len(question_text) > 10:  # Filter out very short matches
                    question = {
                        'type': q_type,
                        'text': question_text,
                        'full_match': match.group(0),
                        'position': match.start(),
                        'confidence': self._calculate_confidence(question_text, q_type)
                    }
                    
                    # Extract additional context for multiple choice
                    if q_type == 'multiple_choice':
                        options = self._extract_mc_options(content, match.end())
                        question['options'] = options
                    
                    questions.append(question)
        
        # Remove duplicates and sort by confidence
        questions = self._deduplicate_questions(questions)
        questions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return questions
    
    def _extract_mc_options(self, content: str, start_pos: int) -> List[str]:
        """Extract multiple choice options following a question"""
        options = []
        remaining_content = content[start_pos:start_pos + 500]  # Look ahead 500 chars
        
        option_pattern = r'([A-E])[\.\)]\s*([^\n]+)'
        matches = re.finditer(option_pattern, remaining_content)
        
        for match in matches:
            option_letter = match.group(1)
            option_text = match.group(2).strip()
            options.append(f"{option_letter}. {option_text}")
        
        return options
    
    def _extract_answers(self, content: str) -> List[Dict[str, Any]]:
        """Extract answers and marking schemes"""
        answers = []
        
        for answer_type, patterns in self.answer_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
                for match in matches:
                    answer_text = match.group(1) if match.groups() else match.group(0)
                    answers.append({
                        'type': answer_type,
                        'text': answer_text.strip(),
                        'position': match.start()
                    })
        
        return answers
    
    def _detect_subjects(self, content: str) -> List[str]:
        """Detect subjects based on content keywords"""
        detected_subjects = []
        content_lower = content.lower()
        
        for subject, keywords in self.subject_indicators.items():
            keyword_count = sum(1 for keyword in keywords if keyword in content_lower)
            if keyword_count >= 2:  # Require at least 2 keywords
                confidence = keyword_count / len(keywords)
                detected_subjects.append({
                    'subject': subject,
                    'confidence': confidence,
                    'keyword_matches': keyword_count
                })
        
        # Sort by confidence
        detected_subjects.sort(key=lambda x: x['confidence'], reverse=True)
        return detected_subjects
    
    def _analyze_difficulty(self, content: str) -> Dict[str, int]:
        """Analyze difficulty levels based on command words"""
        difficulty_counts = {'easy': 0, 'medium': 0, 'hard': 0}
        content_lower = content.lower()
        
        for difficulty, indicators in self.difficulty_indicators.items():
            for indicator in indicators:
                difficulty_counts[difficulty] += len(re.findall(rf'\b{indicator}\b', content_lower))
        
        return difficulty_counts
    
    def _extract_style_patterns(self, content: str) -> Dict[str, Any]:
        """Extract formatting and style patterns"""
        patterns = {
            'numbering_style': self._detect_numbering_style(content),
            'question_format': self._detect_question_format(content),
            'answer_format': self._detect_answer_format(content),
            'marking_style': self._detect_marking_style(content)
        }
        return patterns
    
    def _detect_numbering_style(self, content: str) -> str:
        """Detect question numbering style"""
        if re.search(r'\d+\.\s', content):
            return 'decimal'
        elif re.search(r'\d+\)\s', content):
            return 'parentheses'
        elif re.search(r'Question\s+\d+', content, re.IGNORECASE):
            return 'question_word'
        else:
            return 'none'
    
    def _detect_question_format(self, content: str) -> str:
        """Detect overall question format"""
        if 'SECTION A' in content.upper() or 'PART I' in content.upper():
            return 'sectioned'
        elif re.search(r'(?i)choose\s+the\s+correct', content):
            return 'multiple_choice_focused'
        elif re.search(r'(?i)answer\s+all\s+questions', content):
            return 'comprehensive'
        else:
            return 'standard'
    
    def _detect_answer_format(self, content: str) -> str:
        """Detect answer format style"""
        if re.search(r'(?i)answer\s*[:\-]\s*[A-E]', content):
            return 'letter_answers'
        elif re.search(r'(?i)solution\s*:', content):
            return 'detailed_solutions'
        elif re.search(r'\[.*marks?\]', content):
            return 'marked_answers'
        else:
            return 'simple_answers'
    
    def _detect_marking_style(self, content: str) -> str:
        """Detect marking scheme style"""
        if re.search(r'\[(\d+)\s*marks?\]', content):
            return 'bracket_marks'
        elif re.search(r'\((\d+)\s*marks?\)', content):
            return 'parentheses_marks'
        elif re.search(r'(?i)total\s*:\s*\d+\s*marks?', content):
            return 'total_marks'
        else:
            return 'no_marks'
    
    def _calculate_confidence(self, question_text: str, q_type: str) -> float:
        """Calculate confidence score for question classification"""
        confidence = 0.5  # Base confidence
        
        # Boost confidence based on question type indicators
        if q_type == 'multiple_choice' and re.search(r'[A-E][\.\)]', question_text):
            confidence += 0.3
        elif q_type == 'short_answer' and question_text.endswith('?'):
            confidence += 0.2
        elif q_type == 'essay' and any(word in question_text.lower() for word in ['discuss', 'analyze', 'evaluate']):
            confidence += 0.3
        elif q_type == 'calculation' and any(word in question_text.lower() for word in ['calculate', 'find', 'solve']):
            confidence += 0.3
        
        # Reduce confidence for very short or very long questions
        if len(question_text) < 20:
            confidence -= 0.2
        elif len(question_text) > 500:
            confidence -= 0.1
        
        return max(0.0, min(1.0, confidence))
    
    def _deduplicate_questions(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate questions based on text similarity"""
        unique_questions = []
        
        for question in questions:
            is_duplicate = False
            for existing in unique_questions:
                # Simple similarity check based on text overlap
                similarity = self._calculate_text_similarity(question['text'], existing['text'])
                if similarity > 0.8:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_questions.append(question)
        
        return unique_questions
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple text similarity"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if analysis['question_count'] == 0:
            recommendations.append("No questions detected. Consider formatting content with clear question indicators.")
        
        if not analysis['has_answers']:
            recommendations.append("No answers found. Including answers will improve AI training effectiveness.")
        
        if len(analysis['subjects_detected']) == 0:
            recommendations.append("Subject could not be determined. Adding subject-specific keywords will help.")
        
        if analysis['question_count'] > 0:
            dominant_type = max(analysis['question_types'], key=analysis['question_types'].get)
            recommendations.append(f"Dominant question type: {dominant_type}. AI will adapt to this style.")
        
        if sum(analysis['difficulty_levels'].values()) == 0:
            recommendations.append("Difficulty level unclear. Use command words like 'define', 'explain', 'analyze'.")
        
        return recommendations
    
    def generate_training_prompt(self, analysis: Dict[str, Any]) -> str:
        """Generate a training prompt based on the analysis"""
        prompt_parts = []
        
        # Add subject context
        if analysis['subjects_detected']:
            subject = analysis['subjects_detected'][0]['subject']
            prompt_parts.append(f"Subject: {subject.title()}")
        
        # Add question style information
        if analysis['question_types']:
            types = list(analysis['question_types'].keys())
            prompt_parts.append(f"Question types: {', '.join(types)}")
        
        # Add difficulty context
        if analysis['difficulty_levels']:
            dominant_difficulty = max(analysis['difficulty_levels'], key=analysis['difficulty_levels'].get)
            prompt_parts.append(f"Difficulty level: {dominant_difficulty}")
        
        # Add style patterns
        if analysis['style_patterns']:
            style_info = []
            for pattern_type, pattern_value in analysis['style_patterns'].items():
                if pattern_value != 'none' and pattern_value != 'standard':
                    style_info.append(f"{pattern_type}: {pattern_value}")
            if style_info:
                prompt_parts.append(f"Style patterns: {', '.join(style_info)}")
        
        base_prompt = "You are an AI tutor trained on Malawian educational content. "
        if prompt_parts:
            context = " | ".join(prompt_parts)
            return f"{base_prompt}Context: {context}. Generate questions and answers following these patterns and styles."
        else:
            return f"{base_prompt}Generate educational questions and answers appropriate for Malawian curriculum."

# Global analyzer instance
question_analyzer = QuestionStyleAnalyzer()
