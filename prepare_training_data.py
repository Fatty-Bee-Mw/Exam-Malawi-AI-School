#!/usr/bin/env python3
"""
Prepare Training Data for Exam AI Malawi
Converts chat interactions and uploaded files into training format
"""

import json
import os
from pathlib import Path
from datetime import datetime

def prepare_chat_data():
    """Convert chat interactions to training format"""
    
    # Path to chat interactions logged by the backend
    chat_log_file = Path("backend/training_data/chat_interactions.jsonl")
    
    if not chat_log_file.exists():
        print("No chat interactions found. Start using the AI assistant to generate training data!")
        return []
    
    training_examples = []
    
    with open(chat_log_file, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                interaction = json.loads(line.strip())
                
                # Format for training: Question -> Answer pairs
                training_text = f"""Question: {interaction['user_message']}
Answer: {interaction['ai_response']}

"""
                training_examples.append(training_text)
                
            except json.JSONDecodeError:
                continue
    
    print(f"Prepared {len(training_examples)} chat interactions for training")
    return training_examples

def prepare_educational_content():
    """Create educational content for training"""
    
    educational_content = [
        # Mathematics examples
        """Question: What is 15 + 27?
Answer: To solve 15 + 27, I'll add these numbers step by step:
15 + 27 = 42

The answer is 42.

""",
        """Question: How do I find the area of a rectangle?
Answer: To find the area of a rectangle, use this formula:
Area = length × width

For example, if a rectangle is 8 meters long and 5 meters wide:
Area = 8 × 5 = 40 square meters

""",
        
        # English examples
        """Question: What is a noun?
Answer: A noun is a word that names a person, place, thing, or idea.

Examples:
- Person: teacher, student, doctor
- Place: school, hospital, Malawi
- Thing: book, computer, car
- Idea: happiness, freedom, education

""",
        """Question: What is the past tense of "go"?
Answer: The past tense of "go" is "went".

Examples:
- Present: "I go to school every day"
- Past: "Yesterday, I went to school"

""",
        
        # Science examples
        """Question: What is photosynthesis?
Answer: Photosynthesis is the process plants use to make their own food using sunlight.

The process:
1. Plants absorb sunlight and carbon dioxide
2. Roots absorb water from soil
3. Chlorophyll captures light energy
4. Plants combine these to make glucose (sugar)
5. Oxygen is released as waste

This is why plants are green and why we have oxygen to breathe!

""",
        
        # Malawi-specific content
        """Question: When did Malawi gain independence?
Answer: Malawi gained independence on July 6, 1964, from British colonial rule.

Key facts:
- Dr. Hastings Kamuzu Banda became the first President
- The country was formerly called Nyasaland
- Independence Day is celebrated every July 6th
- Malawi became a republic in 1966

""",
        """Question: What are the major cities in Malawi?
Answer: The major cities in Malawi are:

1. **Lilongwe** - The capital city (since 1975)
2. **Blantyre** - The commercial center and largest city
3. **Mzuzu** - Major city in the northern region
4. **Zomba** - Former capital city

Lilongwe is located in the central region and serves as the political center, while Blantyre in the south is the economic hub.

"""
    ]
    
    print(f"Prepared {len(educational_content)} educational examples")
    return educational_content

def create_training_file():
    """Create comprehensive training file"""
    
    # Collect all training data
    chat_data = prepare_chat_data()
    educational_data = prepare_educational_content()
    
    # Combine all data
    all_training_data = chat_data + educational_data
    
    if not all_training_data:
        print("No training data available!")
        return None
    
    # Create training directory
    training_dir = Path("training_data_prepared")
    training_dir.mkdir(exist_ok=True)
    
    # Save training file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    training_file = training_dir / f"exam_ai_malawi_training_{timestamp}.txt"
    
    with open(training_file, 'w', encoding='utf-8') as f:
        f.write("# Exam AI Malawi Training Data\n")
        f.write(f"# Generated on: {datetime.now().isoformat()}\n")
        f.write(f"# Total examples: {len(all_training_data)}\n\n")
        
        for example in all_training_data:
            f.write(example)
    
    print(f"Created training file: {training_file}")
    print(f"Total training examples: {len(all_training_data)}")
    
    return str(training_file)

if __name__ == "__main__":
    print("Preparing Training Data for Exam AI Malawi...")
    training_file = create_training_file()
    
    if training_file:
        print(f"\nNext steps:")
        print(f"1. Run: python model_trainer_gui.py")
        print(f"2. Select the training data folder: training_data_prepared")
        print(f"3. Set model path to: my_small_model")
        print(f"4. Click 'Start Training'")
        print(f"\nTraining file ready: {training_file}")
    else:
        print("\nNo training data available. Use the AI assistant first to generate conversations!")
