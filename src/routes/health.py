# Health Check Endpoint for Railway Deployment
# Provides system status and API health information

from flask import Blueprint, jsonify
import os
import sys
from datetime import datetime

# Create health blueprint
health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for monitoring and deployment verification.
    Returns system status, uptime, and API availability.
    """
    try:
        # Basic system information
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'RPG Fantasy Backend API',
            'version': '1.0.0',
            'environment': os.getenv('FLASK_ENV', 'development'),
            'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            'platform': sys.platform,
            'endpoints': {
                'narrative': '/narrative/generate',
                'simulation': '/simulation/process',
                'user': '/user/create',
                'llm': '/llm/generate',
                'images': '/images/generate',
                'interaction': '/interaction/process'
            },
            'database': {
                'type': 'SQLite',
                'status': 'connected'
            }
        }
        
        # Check database connectivity
        try:
            from src.database.db_manager import DatabaseManager
            db = DatabaseManager()
            # Simple query to test database
            db.execute_query("SELECT 1")
            health_data['database']['status'] = 'connected'
        except Exception as db_error:
            health_data['database']['status'] = 'error'
            health_data['database']['error'] = str(db_error)
            health_data['status'] = 'degraded'
        
        # Return appropriate HTTP status
        status_code = 200 if health_data['status'] == 'healthy' else 503
        
        return jsonify(health_data), status_code
        
    except Exception as e:
        # Critical error - service unavailable
        error_response = {
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e),
            'service': 'RPG Fantasy Backend API'
        }
        return jsonify(error_response), 503

@health_bp.route('/ping', methods=['GET'])
def ping():
    """
    Simple ping endpoint for basic connectivity testing.
    Returns minimal response for quick health checks.
    """
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'pong'
    }), 200

@health_bp.route('/version', methods=['GET'])
def version():
    """
    Version information endpoint.
    Returns API version and build information.
    """
    return jsonify({
        'service': 'RPG Fantasy Backend API',
        'version': '1.0.0',
        'build_date': '2024-01-21',
        'environment': os.getenv('FLASK_ENV', 'development'),
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }), 200