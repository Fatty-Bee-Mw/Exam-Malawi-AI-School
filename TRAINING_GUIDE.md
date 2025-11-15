# 🚀 Exam AI Malawi - Local Model Training Guide

## Overview
This guide will help you train your own ChatGPT-like language model locally using your existing `model.safetensors` file and the training GUI.

## ✅ Prerequisites
- Python 3.11+ installed
- Your existing `my_small_model/model.safetensors` file (641MB)
- Training data (automatically generated from chat interactions)

## 🎯 Quick Start

### Step 1: Prepare Training Data
```bash
python prepare_training_data.py
```
This will:
- Extract chat interactions from your AI assistant
- Add educational content for Malawian students
- Create formatted training files

### Step 2: Start Training GUI
```bash
python start_training_gui.py
```
Or directly:
```bash
python model_trainer_gui.py
```

### Step 3: Configure Training
In the GUI:
1. **Model Path**: Set to `my_small_model`
2. **Training Data**: Click "Select Folder" → Choose `training_data_prepared`
3. **Start Training**: Click "Start Training"

### Step 4: Monitor Progress
- Watch the progress bar for training status
- Check the log for detailed information
- Training can be paused/resumed/stopped as needed

### Step 5: Integrate Trained Model
```bash
python integrate_trained_model.py
```

## 📊 Training Data Sources

### Automatic Data Collection
Your AI assistant automatically logs:
- ✅ User questions and AI responses
- ✅ Chat interactions with timestamps
- ✅ User feedback and corrections

### Pre-built Educational Content
Includes examples for:
- 📚 **Mathematics**: Basic arithmetic, algebra, geometry
- 📖 **English**: Grammar, vocabulary, writing
- 🔬 **Science**: Biology, chemistry, physics
- 🇲🇼 **Malawi Studies**: History, geography, culture

## 🔧 Training Process

### What Happens During Training
1. **Data Processing**: Text is cleaned and formatted
2. **Tokenization**: Text is converted to model tokens
3. **Fine-tuning**: Your model learns from the data
4. **Validation**: Model performance is tested
5. **Saving**: Updated model is saved to `my_small_model/`

### Training Parameters
- **Batch Size**: Automatically optimized
- **Learning Rate**: Conservative for stability
- **Epochs**: Multiple passes through data
- **Validation**: Regular performance checks

## 📈 Improving Your Model

### Collect More Training Data
1. **Use the AI Assistant**: Ask questions, get responses
2. **Upload Educational Content**: Use admin dashboard
3. **Add Malawi-Specific Content**: Local examples and context
4. **Include Student Conversations**: Real Q&A sessions

### Best Practices
- ✅ **Quality over Quantity**: Better to have good examples
- ✅ **Diverse Topics**: Cover all subjects equally
- ✅ **Local Context**: Include Malawian examples
- ✅ **Regular Training**: Retrain weekly with new data

## 🚀 Production Deployment

### After Training
1. **Test the Model**: Use the web interface
2. **Backup Original**: Keep your base model safe
3. **Monitor Performance**: Check response quality
4. **Iterate**: Collect feedback and retrain

### Integration with Web Platform
Your trained model automatically works with:
- ✅ **AI Assistant**: Chat interface
- ✅ **Question Generation**: Educational content
- ✅ **Admin Dashboard**: Model monitoring
- ✅ **Real-time Updates**: Live model switching

## 🛠️ Troubleshooting

### Common Issues

**Training GUI Won't Start**
```bash
pip install tkinter transformers torch
```

**Out of Memory Error**
- Reduce batch size in training settings
- Close other applications
- Use smaller training files

**Model Not Loading**
- Check `my_small_model/` directory exists
- Verify `model.safetensors` file is present
- Restart backend server after training

**Poor Model Performance**
- Add more diverse training data
- Include more Malawian context
- Train for more epochs
- Validate training examples quality

## 📁 File Structure
```
Exam-AI-Mw Schools/
├── my_small_model/              # Your trained model
│   ├── model.safetensors        # Model weights
│   ├── config.json              # Model configuration
│   └── model_info.json          # Training metadata
├── training_data_prepared/       # Formatted training data
├── backend/training_data/        # Raw chat logs
├── model_trainer_gui.py         # Training interface
├── prepare_training_data.py     # Data preparation
└── integrate_trained_model.py   # Model integration
```

## 🎓 Advanced Training

### Custom Training Data Format
```
Question: What is photosynthesis?
Answer: Photosynthesis is the process plants use to make food...

Question: Calculate 15 + 27
Answer: 15 + 27 = 42

```

### Batch Training Commands
```bash
# Full training pipeline
python prepare_training_data.py
python model_trainer_gui.py
python integrate_trained_model.py
```

## 📞 Support
- Check logs in the training GUI
- Review `TRAINING_GUIDE.md` for detailed steps
- Test with simple questions first
- Monitor model performance in admin dashboard

---

**Your AI model will become smarter with each training session!** 🧠✨
