import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading
import time
import uuid
from file_processors import file_processor
from question_analyzer import question_analyzer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, model_path: str = "../my_small_model"):
        self.model_path = Path(model_path)
        self.training_data_path = self.model_path / "training_data"
        self.training_sessions_path = self.model_path / "training_sessions"
        self.training_status = {
            "is_training": False,
            "progress": 0,
            "current_file": "",
            "total_files": 0,
            "processed_files": 0,
            "errors": [],
            "start_time": None,
        }
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Create directories for persistent storage
        self.training_data_path.mkdir(parents=True, exist_ok=True)
        self.training_sessions_path.mkdir(parents=True, exist_ok=True)
        
        # Load existing training data index
        self.data_index_file = self.training_data_path / "data_index.json"
        self.training_data_index = self._load_data_index()
        
    async def start_training(self, files_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Start the training process with uploaded files"""
        if self.training_status["is_training"]:
            return {"success": False, "error": "Training already in progress"}
        
        try:
            # Reset training status
            self.training_status = {
                "is_training": True,
                "progress": 0,
                "current_file": "",
                "total_files": len(files_data),
                "processed_files": 0,
                "errors": [],
                "start_time": datetime.now().isoformat(),
            }
            
            # Start training in background
            asyncio.create_task(self._process_training_files(files_data))
            
            return {"success": True, "message": "Training started successfully"}
            
        except Exception as e:
            logger.error(f"Failed to start training: {e}")
            self.training_status["is_training"] = False
            return {"success": False, "error": str(e)}
    
    async def _process_training_files(self, files_data: List[Dict[str, Any]]):
        """Process training files with multithreading"""
        try:
            batch_size = 3  # Process 3 files at a time
            batches = [files_data[i:i + batch_size] for i in range(0, len(files_data), batch_size)]
            
            for batch_index, batch in enumerate(batches):
                # Process batch in parallel using thread pool
                tasks = []
                for file_index, file_data in enumerate(batch):
                    global_index = batch_index * batch_size + file_index
                    task = asyncio.get_event_loop().run_in_executor(
                        self.executor, 
                        self._process_single_file, 
                        file_data, 
                        global_index
                    )
                    tasks.append(task)
                
                # Wait for all files in batch to complete
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Update progress
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        error_msg = f"Error processing {batch[i]['name']}: {str(result)}"
                        self.training_status["errors"].append(error_msg)
                        logger.error(error_msg)
                    
                    self.training_status["processed_files"] += 1
                    self.training_status["progress"] = int(
                        (self.training_status["processed_files"] / self.training_status["total_files"]) * 100
                    )
            
            # Training completed
            self.training_status["is_training"] = False
            self.training_status["progress"] = 100
            self.training_status["current_file"] = "Training completed!"
            
            # Save training results
            await self._save_training_results()
            
            logger.info("Training completed successfully")
            
        except Exception as e:
            logger.error(f"Training process failed: {e}")
            self.training_status["is_training"] = False
            self.training_status["errors"].append(f"Training failed: {str(e)}")
    
    def _process_single_file(self, file_data: Dict[str, Any], file_index: int) -> Dict[str, Any]:
        """Process a single training file with persistent storage"""
        try:
            filename = file_data.get("name", f"file_{file_index}")
            content = file_data.get("content", "")
            file_size = len(content.encode('utf-8'))
            
            # Update current file being processed
            self.training_status["current_file"] = filename
            
            # Simulate processing time based on file size
            processing_time = min(3.0, max(0.5, file_size / 10000))  # 0.5-3 seconds
            time.sleep(processing_time)
            
            # Extract and clean text content based on file type
            if hasattr(file_data, 'read'):  # File-like object
                file_content = file_data.read()
                if isinstance(file_content, str):
                    file_content = file_content.encode('utf-8')
            else:
                # String content
                file_content = content.encode('utf-8') if isinstance(content, str) else content
            
            # Use file processor to extract text
            extraction_result = file_processor.extract_text(file_content, filename)
            
            if not extraction_result["success"]:
                raise ValueError(f"Failed to extract text: {extraction_result.get('error', 'Unknown error')}")
            
            cleaned_content = extraction_result["text"]
            
            if not cleaned_content.strip():
                raise ValueError("File contains no valid text content")
            
            # Analyze content for question patterns and styles
            content_type = file_data.get("contentType", "general")
            question_analysis = question_analyzer.analyze_content(cleaned_content, content_type)
            
            # Enhance content with question style information
            if question_analysis["question_count"] > 0:
                style_prompt = question_analyzer.generate_training_prompt(question_analysis)
                enhanced_content = f"{style_prompt}\n\n{cleaned_content}"
                logger.info(f"Enhanced {filename} with question analysis: {question_analysis['question_count']} questions, "
                           f"types: {list(question_analysis['question_types'].keys())}")
            else:
                enhanced_content = cleaned_content
            
            # Simulate data validation
            if len(cleaned_content) < 10:
                raise ValueError("File content too short for training")
            
            # Generate unique file ID and save to persistent storage
            file_id = f"data_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file_index}"
            persistent_file_path = self.training_data_path / f"{file_id}.txt"
            
            with open(persistent_file_path, 'w', encoding='utf-8') as f:
                f.write(enhanced_content)
            
            # Add to data index for management
            file_metadata = {
                "id": file_id,
                "original_filename": filename,
                "file_path": str(persistent_file_path),
                "file_size": len(enhanced_content),
                "upload_date": datetime.now().isoformat(),
                "processing_time": processing_time,
                "status": "active",
                "content_type": content_type,
                "question_analysis": {
                    "question_count": question_analysis["question_count"],
                    "question_types": question_analysis["question_types"],
                    "subjects_detected": question_analysis["subjects_detected"],
                    "has_answers": question_analysis["has_answers"],
                    "style_patterns": question_analysis["style_patterns"]
                }
            }
            
            self.training_data_index[file_id] = file_metadata
            self._save_data_index()
            
            logger.info(f"Successfully processed and stored {filename} as {file_id}")
            
            return {
                "filename": filename,
                "file_id": file_id,
                "status": "success",
                "processed_size": len(cleaned_content),
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            raise e
    
    def _extract_text_from_file(self, file_content: bytes, filename: str) -> str:
        """Extract text from various file formats"""
        file_ext = Path(filename).suffix.lower()
        
        try:
            if file_ext == '.txt':
                return file_content.decode('utf-8', errors='ignore')
            
            elif file_ext == '.pdf':
                return self._extract_from_pdf(file_content)
            
            elif file_ext in ['.doc', '.docx']:
                return self._extract_from_docx(file_content)
            
            elif file_ext in ['.csv']:
                return self._extract_from_csv(file_content)
            
            elif file_ext in ['.xlsx', '.xls']:
                return self._extract_from_excel(file_content)
            # Join back
            cleaned = '\n'.join(lines)
            
            # Ensure minimum length
            if len(cleaned) < 50:
                raise ValueError("Cleaned content too short")
            
            return cleaned
            
        except Exception as e:
            logger.error(f"Error cleaning text data: {e}")
            raise ValueError(f"Failed to clean text data: {str(e)}")
    
    async def _save_training_results(self):
        """Save training results and update model metadata"""
        try:
            results = {
                "training_completed": datetime.now().isoformat(),
                "total_files": self.training_status["total_files"],
                "processed_files": self.training_status["processed_files"],
                "errors": self.training_status["errors"],
                "start_time": self.training_status["start_time"],
                "success_rate": (self.training_status["processed_files"] - len(self.training_status["errors"])) / self.training_status["total_files"] * 100
            }
            
            # Save training log
            log_file = self.model_path / "training_logs" / f"training_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            log_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(log_file, 'w') as f:
                json.dump(results, f, indent=2)
            
            # Update model metadata
            metadata_file = self.model_path / "model_metadata.json"
            metadata = {}
            
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
            
            metadata.update({
                "last_training": datetime.now().isoformat(),
                "training_files_count": self.training_status["processed_files"],
                "model_version": metadata.get("model_version", "1.0") + "_updated",
                "training_success_rate": results["success_rate"]
            })
            
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logger.info("Training results saved successfully")
            
        except Exception as e:
            logger.error(f"Failed to save training results: {e}")
    
    def get_training_status(self) -> Dict[str, Any]:
        """Get current training status"""
        return self.training_status.copy()
    
    def stop_training(self) -> Dict[str, Any]:
        """Stop the current training process"""
        if not self.training_status["is_training"]:
            return {"success": False, "error": "No training in progress"}
        
        try:
            self.training_status["is_training"] = False
            self.training_status["current_file"] = "Training stopped by user"
            
            # Shutdown executor
            self.executor.shutdown(wait=False)
            self.executor = ThreadPoolExecutor(max_workers=4)  # Create new executor
            
            logger.info("Training stopped by user")
            return {"success": True, "message": "Training stopped successfully"}
            
        except Exception as e:
            logger.error(f"Failed to stop training: {e}")
            return {"success": False, "error": str(e)}
    
    def _load_data_index(self) -> Dict[str, Any]:
        """Load the training data index from file"""
        try:
            if self.data_index_file.exists():
                with open(self.data_index_file, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            logger.error(f"Failed to load data index: {e}")
            return {}
    
    def _save_data_index(self):
        """Save the training data index to file"""
        try:
            with open(self.data_index_file, 'w') as f:
                json.dump(self.training_data_index, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save data index: {e}")
    
    def get_training_data_list(self) -> List[Dict[str, Any]]:
        """Get list of all stored training data"""
        try:
            data_list = []
            for file_id, metadata in self.training_data_index.items():
                if metadata.get("status") == "active":
                    # Check if file still exists
                    file_path = Path(metadata["file_path"])
                    if file_path.exists():
                        metadata["current_size"] = file_path.stat().st_size
                        data_list.append(metadata)
                    else:
                        # Mark as missing
                        metadata["status"] = "missing"
                        self._save_data_index()
            
            # Sort by upload date (newest first)
            data_list.sort(key=lambda x: x["upload_date"], reverse=True)
            return data_list
            
        except Exception as e:
            logger.error(f"Failed to get training data list: {e}")
            return []
    
    def delete_training_data(self, file_ids: List[str]) -> Dict[str, Any]:
        """Delete selected training data files"""
        try:
            deleted_count = 0
            errors = []
            
            for file_id in file_ids:
                if file_id in self.training_data_index:
                    metadata = self.training_data_index[file_id]
                    file_path = Path(metadata["file_path"])
                    
                    try:
                        # Delete the actual file
                        if file_path.exists():
                            file_path.unlink()
                        
                        # Mark as deleted in index
                        metadata["status"] = "deleted"
                        metadata["deleted_date"] = datetime.now().isoformat()
                        deleted_count += 1
                        
                        logger.info(f"Deleted training data file: {file_id}")
                        
                    except Exception as e:
                        error_msg = f"Failed to delete {file_id}: {str(e)}"
                        errors.append(error_msg)
                        logger.error(error_msg)
                else:
                    errors.append(f"File ID not found: {file_id}")
            
            # Save updated index
            self._save_data_index()
            
            return {
                "success": True,
                "deleted_count": deleted_count,
                "errors": errors,
                "message": f"Successfully deleted {deleted_count} files"
            }
            
        except Exception as e:
            logger.error(f"Failed to delete training data: {e}")
            return {"success": False, "error": str(e)}
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics for training data"""
        try:
            total_files = 0
            total_size = 0
            active_files = 0
            deleted_files = 0
            
            for file_id, metadata in self.training_data_index.items():
                total_files += 1
                if metadata.get("status") == "active":
                    active_files += 1
                    file_path = Path(metadata["file_path"])
                    if file_path.exists():
                        total_size += file_path.stat().st_size
                elif metadata.get("status") == "deleted":
                    deleted_files += 1
            
            return {
                "total_files": total_files,
                "active_files": active_files,
                "deleted_files": deleted_files,
                "total_size_bytes": total_size,
                "storage_path": str(self.training_data_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to get storage stats: {e}")
            return {"error": str(e)}

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        try:
            model_file = self.model_path / "model.safetensors"
            metadata_file = self.model_path / "model_metadata.json"
            
            info = {
                "model_exists": model_file.exists(),
                "model_size": model_file.stat().st_size if model_file.exists() else 0,
                "model_path": str(model_file),
                "last_modified": datetime.fromtimestamp(model_file.stat().st_mtime).isoformat() if model_file.exists() else None
            }
            
            # Load metadata if exists
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                info.update(metadata)
            
            # Add storage statistics
            storage_stats = self.get_storage_stats()
            info["training_data"] = storage_stats
            
            return info
            
        except Exception as e:
            logger.error(f"Failed to get model info: {e}")
            return {"error": str(e)}

# Global trainer instance
trainer = ModelTrainer()

# FastAPI endpoints would use this trainer instance
async def start_model_training(files_data: List[Dict[str, Any]]):
    """API endpoint to start training"""
    return await trainer.start_training(files_data)

async def get_training_status():
    """API endpoint to get training status"""
    return trainer.get_training_status()

async def stop_model_training():
    """API endpoint to stop training"""
    return trainer.stop_training()

async def get_model_information():
    """API endpoint to get model info"""
    return trainer.get_model_info()
